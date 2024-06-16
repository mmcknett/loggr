import { FirebaseContext } from '../data/FirebaseContext';
import { useContext, useEffect, MouseEvent, useRef, MutableRefObject, FormEvent, useCallback } from 'react';
import { addLog } from '../hooks/use-logs';
import { Timestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { DEFAULT_LIST, ILog } from '../data/data-types';
import { useAccount } from '../hooks/use-account';
import { useInProgress } from '../hooks/use-in-progress';
import { shouldSaveDraftQuickly } from '../data/dev-mode';
import Spinner from './Spinner';

const DRAFT_SAVE_SPEED = shouldSaveDraftQuickly ?
  1000: // DEBUG: Save a draft on changes after a second.
  5000; // Save a draft on changes after 5 seconds.

export function twoDig(singleOrDoubleDigit: number | string) {
  return singleOrDoubleDigit.toString().padStart(2, '0');
}

function dateString(date = new Date()) {
  return `${date.getFullYear()}-${twoDig(date.getMonth() + 1)}-${twoDig(date.getDate())}`;
}
function timeString(date = new Date()) {
  return `${twoDig(date.getHours())}:${twoDig(date.getMinutes())}`;
}

type TimeEntryFormData = {
  dateEntry?: string;
  startTime?: string;
  list?: string;
  endTime?: string;
  note?: string;
};

function getLogFromFormFields(
  formFields: TimeEntryFormData,
  recentList?: string,
  allowEmptyList: boolean = true)
{
  const start = formFields.startTime && Timestamp.fromDate(new Date(`${formFields.dateEntry}T${formFields.startTime}`));
  const end = formFields.endTime && Timestamp.fromDate(new Date(`${formFields.dateEntry}T${formFields.endTime}`));
  
  // If the list exists and it's not empty or empty lists are allowed, use the list.
  // Otherwise, pick the recent list or the default list.
  let list = formFields.list || '';
  if (list === '' && !allowEmptyList) {
    list = recentList || DEFAULT_LIST;
  }

  const entry: ILog = {
    ...(start && {startTime: start}),
    ...(end && {endTime: end}),
    note: formFields.note || '',
    list
  };

  return entry;
}

function getFormFieldsFromLog(log?: ILog) {
  const fields: TimeEntryFormData = {
    ...(log?.startTime && { startTime: timeString(log!.startTime!.toDate()) }),
    ...(log?.endTime && { endTime: timeString(log!.endTime!.toDate()) } || { endTime: '' }),
    ...(log?.startTime && { dateEntry: dateString(log!.startTime!.toDate()) }),
    note: log?.note || '',
    list: log?.list || ''
  };
  return fields;
}

function makeDefaultFormValues(log?: ILog) {
  return {
    dateEntry: dateString(),
    startTime: timeString(),
    ...getFormFieldsFromLog(log)
  };
}

export function TimeEntryForm() {
  const fBaseContext = useContext(FirebaseContext)!;

  const { account, deleteDraft, saveDraft } = useAccount(fBaseContext);
  const { draft, recentList } = account;

  // Populate the lists from the account's list cache, or use the default list.
  const lists = (account.listCache && account.listCache.length > 0) ? account.listCache : [DEFAULT_LIST];
  const addLogCb = useCallback((entry: ILog) => addLog(fBaseContext, entry), [fBaseContext]);

  const draftSaved = draft?.savedTime?.toDate().toLocaleString() || '';

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset: useFormReset } = useForm<TimeEntryFormData>({
    defaultValues: makeDefaultFormValues(draft?.log),
    values: getFormFieldsFromLog(draft?.log)
  });

  const reset = (evt?: MouseEvent<HTMLButtonElement>) => {
    evt?.preventDefault(); // Required for form reset to work as expected w/ useForm
    useFormReset(makeDefaultFormValues(draft?.log));
  };

  useEffect(() => {
    // Draft has changed and has data, so reset.
    if (draft) {
      reset();
    } else {
      const defaultVals = makeDefaultFormValues();
      useFormReset(defaultVals);
    }
  }, [draft, useFormReset]);

  const draftSaveTimeoutRef: MutableRefObject<number | null> = useRef(null);
  const cancelDraftSave = () => {
    if (typeof draftSaveTimeoutRef.current === 'number') {
      window.clearTimeout(draftSaveTimeoutRef.current);
    }
  }

  useEffect(() => {
    const subscription = watch((formData, { name: fieldName }) => {
      // If a change occurred, schedule saving a draft. Cancel any pending draft saves.
      if (!fieldName) {
        // Don't schedule a draft save if this isn't the result of a field being changed.
        return;
      }

      // Cancel any previous saves.
      cancelDraftSave();

      // When creating a draft, don't save the list if it's a default or most-recent list.
      // We only want to track the default or most-recently-used list when actually
      // committing the log entry.
      const entry = getLogFromFormFields(formData);
      draftSaveTimeoutRef.current = window.setTimeout(async () => {
        await saveDraft(entry);
      }, DRAFT_SAVE_SPEED);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const submitTimeEntry = async (formData: TimeEntryFormData) => {
    // When saving a log, supply the most-recent list for use when saving.
    const entry = getLogFromFormFields(formData, recentList, false /*allowEmptyList*/);

    cancelDraftSave(); // Stop any in-progress drafts from saving so we don't stomp the form state with it.

    try {
      await addLogCb(entry);
      reset();
    } catch (err: any) {
      console.error(`Failed to submit form: ${err.message}`);
    }
  };

  const [blockingSubmitTimeEntry, submitInProgress] = useInProgress(handleSubmit(submitTimeEntry));
  const blockingSubmitWithPreventDef = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    blockingSubmitTimeEntry();
  }

  const handleDraftDelete = (evt?: MouseEvent<HTMLButtonElement>) => {
    evt?.preventDefault(); // Required for form reset to work as expected w/ useForm
    deleteDraft();
  };

  const setStartToNow = (evt?: MouseEvent<HTMLButtonElement>) => {
    evt?.preventDefault();
    const now = new Date();
    setValue('startTime', timeString(now));
    setValue('dateEntry', dateString(now));
  };

  const setEndToNow = (evt?: MouseEvent<HTMLButtonElement>) => {
    evt?.preventDefault();
    const now = new Date();
    setValue('endTime', timeString(now));
    setValue('dateEntry', dateString(now));
  };

  const defaultPlaceholder = recentList ? `${recentList} (last used)` : `${DEFAULT_LIST} (default)`;

  return (
    <form onSubmit={ blockingSubmitWithPreventDef }>
      <h2>Add Log Entry</h2>

      <label htmlFor='dateEntry'>Date:</label>
      <input type='date' id='dateEntry' {...register('dateEntry', { required: true })} />
      {errors.dateEntry && <small className='error-msg' role='alert'>Date is required.</small>}

      <div className='horiz space-above wrap'>
        <div className='vert'>
          <label htmlFor='startTime'>Start:</label>
          <div className='horiz'>
            <input type='time' id='startTime' {...register('startTime', { required: true })} />
            <button onClick={ setStartToNow }>Now</button>
          </div>
          {errors.startTime && <small className='error-msg' role='alert'>Start time is required.</small>}
        </div>
        
        <div className='vert'>
          <label htmlFor='endTime'>End:</label>
          <div className='horiz'>
            <input type='time' id='endTime' {...register('endTime', { required: true })} />
            <button onClick={ setEndToNow }>Now</button>
          </div>
          {errors.endTime && <small className='error-msg' role='alert'>End time is required.</small>}
        </div>
      </div>

      <label htmlFor='list'>List:</label>
      <input list='lists' autoComplete='off' placeholder={defaultPlaceholder} {...register('list')} />
      <datalist id='lists'>
        { lists.map(listName => <option key={ listName } value={ listName } />) }
      </datalist>

      <label htmlFor='note'>Notes:</label>
      <textarea id='note' {...register('note', { required: true })} />
      {errors.note && <small className='error-msg' role='alert'>Note is required.</small>}

      {draftSaved && <em className='notification'>Draft last saved {draftSaved}</em>}

      <div id='submit-row' className='horiz'>
        <button type='submit' disabled={ submitInProgress }>Add Entry {submitInProgress && <Spinner/>}</button>
        <button type='reset' onClick={handleDraftDelete}>Delete Draft</button>
      </div>
    </form>
  );
}
