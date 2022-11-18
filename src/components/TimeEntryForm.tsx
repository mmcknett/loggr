import { FirebaseContext } from '../data/FirebaseContext';
import { useContext, useEffect, useState, MouseEvent } from 'react';
import { ILog, DEFAULT_LIST, addLog, saveDraft, loadDraft, deleteDraft, useLogs, useAccount } from '../data/logs-collection';
import { Timestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';

const DRAFT_SAVE_SPEED = 5000; // Save a draft on changes after 5 seconds.
// const DRAFT_SAVE_SPEED = 1000; // DEBUG: Save a draft on changes after a second.

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

function getLogFromFormFields(formFields: TimeEntryFormData, recentList?: string, allowEmptyList: boolean = true) {
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
  if (!log) {
    return {};
  }
  
  const fields: TimeEntryFormData = {
    ...(log?.startTime && { startTime: timeString(log!.startTime!.toDate()) }),
    ...(log?.endTime && { endTime: timeString(log!.endTime!.toDate()) }),
    ...(log?.startTime && { dateEntry: dateString(log!.startTime!.toDate()) }),
    note: log?.note || '',
    list: log?.list || ''
  };
  return fields;
}

function makeDefaultFormValues(recentList?: string, log?: ILog) {
  return {
    dateEntry: dateString(),
    startTime: timeString(),
    ...getFormFieldsFromLog(log)
  };
}

export function TimeEntryForm() {
  const fBaseContext = useContext(FirebaseContext)!;

  const account = useAccount(fBaseContext);
  const { draft, recentList } = account;
  const { lists } = useLogs(fBaseContext);

  const draftSaved = draft?.savedTime?.toDate().toLocaleString() || '';

  const { register, handleSubmit, watch, formState: { errors }, reset: useFormReset } = useForm<TimeEntryFormData>({
    defaultValues: makeDefaultFormValues(recentList, draft?.log)
  });

  const reset = (evt?: MouseEvent<HTMLButtonElement>) => {
    evt?.preventDefault(); // Required for form reset to work as expected w/ useForm
    useFormReset(makeDefaultFormValues(recentList, draft?.log));
  };

  useEffect(() => {
    // Draft has changed and has data, so reset.
    if (draft) {
      reset();
    } else {
      const defaultVals = makeDefaultFormValues(undefined, { note: '', list: '' });
      defaultVals.endTime = '';
      useFormReset(defaultVals);
    }
  }, [draft]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    const subscription = watch((formData, { name: fieldName }) => {
      if (!fieldName) {
        // Don't schedule a draft save if this isn't the result of a field being changed.
        return;
      }

      // A change occurred. Schedule saving a draft.
      clearTimeout(timeoutId);

      // When creating a draft, don't save the list if it's a default or most-recent list.
      // We only want to track the default or most-recently-used list when actually
      // committing the log entry.
      const entry = getLogFromFormFields(formData);
      timeoutId = setTimeout(async () => {
        await saveDraft(fBaseContext, entry);
      }, DRAFT_SAVE_SPEED);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const submitTimeEntry = async (formData: TimeEntryFormData) => {
    // When saving a log, supply the most-recent list for use when saving.
    const entry = getLogFromFormFields(formData, recentList, false /*allowEmptyList*/);

    try {
      await addLog(fBaseContext, entry);
      reset();
    } catch (err: any) {
      console.error(`Failed to submit form: ${err.message}`);
    }
  };

  const handleDraftDelete = (evt?: MouseEvent<HTMLButtonElement>) => {
    evt?.preventDefault(); // Required for form reset to work as expected w/ useForm
    deleteDraft(fBaseContext);
  };

  const defaultPlaceholder = recentList ? `${recentList} (last used)` : `${DEFAULT_LIST} (default)`;

  return (
    <form onSubmit={handleSubmit(submitTimeEntry)}>
      <h2>Add Log Entry</h2>

      <label htmlFor='dateEntry'>Date:</label>
      <input type='date' id='dateEntry' {...register('dateEntry', { required: true })} />
      {errors.dateEntry && <small className='error-msg' role='alert'>Date is required.</small>}

      <label htmlFor='startTime'>Start:</label>
      <input tabIndex={1} type='time' id='startTime' {...register('startTime', { required: true })} />
      {errors.startTime && <small className='error-msg' role='alert'>Start time is required.</small>}

      <label htmlFor='list'>List:</label>
      <input list='lists' autoComplete='off' placeholder={defaultPlaceholder} {...register('list')} />
      <datalist id='lists'>
        { lists.map(listName => <option key={ listName } value={ listName } />) }
      </datalist>

      <label htmlFor='note'>Notes:</label>
      <textarea tabIndex={2} id='note' {...register('note', { required: true })} />
      {errors.note && <small className='error-msg' role='alert'>Note is required.</small>}

      <label htmlFor='endTime'>End:</label>
      <input tabIndex={3} type='time' id='endTime' {...register('endTime', { required: true })} />
      {errors.endTime && <small className='error-msg' role='alert'>End time is required.</small>}

      {draftSaved && <em className='notification'>Draft last saved {draftSaved}</em>}

      <div id='submit-row' className='horiz'>
        <button tabIndex={5} type='submit'>Add Entry</button>
        <button type='reset' onClick={handleDraftDelete}>Delete Draft</button>
      </div>
    </form>
  );
}
