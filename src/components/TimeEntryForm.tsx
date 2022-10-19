import { FirebaseContext } from '../data/FirebaseContext';
import { useContext, useEffect, useState } from 'react';
import { ILog, DEFAULT_LIST, addLog, saveDraft, loadDraft, deleteDraft, useLogs } from '../data/logs-collection';
import { Timestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';

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
function getLogFromFormFields(formFields: TimeEntryFormData) {
  const start = Timestamp.fromDate(new Date(`${formFields.dateEntry}T${formFields.startTime}`));
  const end = Timestamp.fromDate(new Date(`${formFields.dateEntry}T${formFields.endTime}`));

  const entry: ILog = {
    startTime: start,
    endTime: end,
    note: formFields.note || '',
    list: formFields.list || DEFAULT_LIST
  };

  return entry;
}
function getFormFieldsFormLog(log: ILog) {
  const fields: TimeEntryFormData = {
    startTime: timeString(log.startTime?.toDate()),
    endTime: timeString(log.endTime?.toDate()),
    dateEntry: dateString(log.startTime?.toDate()),
    note: log.note || '',
    list: log.list || ''
  };
  return fields;
}
export function TimeEntryForm() {
  const fBaseContext = useContext(FirebaseContext)!;
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<TimeEntryFormData>({
    defaultValues: {
      dateEntry: dateString(),
      startTime: timeString()
    }
  });
  const [draftSaved, setDraftSaved] = useState('never');

  const { lists } = useLogs(fBaseContext);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    const subscription = watch((formData, { name: fieldName }) => {
      // A change occurred. Schedule saving a draft in 5 seconds.
      clearTimeout(timeoutId);

      if (!fieldName) {
        // Don't schedule a draft save if this isn't the result of a field being changed.
        return;
      }

      const entry = getLogFromFormFields(formData);
      timeoutId = setTimeout(async () => {
        await saveDraft(fBaseContext, entry);
        setDraftSaved(`at ${new Date().toLocaleTimeString()}`);
      }, 5000);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    async function loadDraftData() {
      const draft = await loadDraft(fBaseContext);
      if (draft) {
        console.log('Draft loaded');
        reset(getFormFieldsFormLog(draft.log));
        setDraftSaved(`at ${draft.savedTime.toDate().toLocaleString()}`);
      }
    }
    loadDraftData();
  }, [reset]);

  const submitTimeEntry = async (formData: TimeEntryFormData) => {
    const entry = getLogFromFormFields(formData);

    try {
      await addLog(fBaseContext, entry);
      reset();
      setDraftSaved('');
    } catch (err: any) {
      console.error(`Failed to submit form: ${err.message}`);
    }
  };

  const handleDraftDelete = () => {
    deleteDraft(fBaseContext);
    setDraftSaved('never');
  };

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
      <input list='lists'  autoComplete='off' {...register('list', { required: true })} />
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
