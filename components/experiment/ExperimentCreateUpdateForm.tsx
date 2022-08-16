import {Prisma} from '@prisma/client';
import {InputGenerator} from 'components/InputGenerator';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {ChangeEvent, useState} from 'react';
import {Experiment, Mouse, Group} from 'types';

type Props = {
  experiment?: Experiment;
  cancelURL: string;
  handleSubmit(formState): void;
};

const setMouseDeceased = async (mouseId, setDeceased: boolean) => {
  const body: Prisma.MouseUpdateArgs = {
    where: {id: mouseId},
    data: {
      deceasedAt: setDeceased ? new Date() : null,
    },
  };
  const res = await fetch('/api/mouse/update', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Error updating mouse');
  }
  // TODO: User feedback for success and failure
  return res.json();
};

type WithPartialMice<T> = Omit<T, 'mice'> & {mice?: Array<Partial<Mouse>>};
type WithPartialGroups<T> = Omit<T, 'groups'> & {groups?: Array<Partial<WithPartialMice<Group>>>};

const ExperimentCreateUpdateForm: React.FC<Props> = (props) => {
  // const [formState, setFormState] = useState<Omit<Partial<Experiment>, 'groups'> & {groups?: Array<Partial<Group>>}>(
  const [formState, setFormState] = useState<Partial<WithPartialGroups<Experiment>>>(
    props.experiment ?? {
      name: '',
    }
  );

  const addEmptyGroup = (groupNumber) => {
    const newState = {...formState};
    if (!newState.groups) {
      newState.groups = [];
    }
    newState.groups.push({
      groupNumber,
      mice: [],
    });
    setFormState(newState);
  };

  const addEmptyMouseFormField = (groupNumber) => {
    const groupIdx = groupNumber - 1;
    const newState = {...formState};
    if (!newState.groups[groupIdx].mice) {
      newState.groups[groupIdx].mice = [];
    }
    if (newState.groups[groupIdx].mice.length > 0) {
      // previous mouse exists
      const prevMouse = newState.groups[groupIdx].mice[newState.groups[groupIdx].mice.length - 1];
      newState.groups[groupIdx].mice.push({
        // Prefill with previous values
        pyratId: prevMouse.pyratId ?? '',
        chipNumber: prevMouse.chipNumber ?? 1,
        mouseNumber: prevMouse.mouseNumber ?? 1,
        gender: prevMouse.gender ?? undefined,
        genoType: prevMouse.genoType ?? '',
      });
    } else {
      newState.groups[groupIdx].mice.push({
        // Prefill with minimum values for number fields
        chipNumber: 1,
        mouseNumber: 1,
      });
    }
    setFormState(newState);
  };

  const renderMiceFormFields = (groupNumber) => {
    const groupIdx = groupNumber - 1;
    const miceState = formState.groups[groupIdx].mice;
    if (!miceState.length) {
      return null;
    }
    return miceState.map((mouse, index) => (
      <fieldset key={`${groupNumber.id}-${mouse.id}-${index}`}>
        <legend>Mouse {index + 1}</legend>
        {InputGenerator([
          {
            label: 'Pyrat ID *',
            name: `${groupNumber.id}-mouse-${index}-pyratId`,
            id: `${groupNumber.id}-mouse-${index}-pyratId`,
            type: 'text',
            defaultValue: mouse.pyratId,
            required: true,
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              const newState = {...formState};
              newState.groups[groupIdx].mice[index].pyratId = e.target.value;
              setFormState(newState);
            },
          },
          {
            label: 'Mouse Number *',
            name: `${groupNumber.id}-mouse-${index}-mouseNumber`,
            id: `${groupNumber.id}-mouse-${index}-mouseNumber`,
            type: 'number',
            defaultValue: mouse.mouseNumber,
            required: true,
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              const newState = {...formState};
              newState.groups[groupIdx].mice[index].mouseNumber = Number(e.target.value);
              setFormState(newState);
            },
          },
          {
            label: 'Chip Number *',
            name: `${groupNumber.id}-mouse-${index}-chipNumber`,
            id: `${groupNumber.id}-mouse-${index}-chipNumber`,
            type: 'number',
            defaultValue: mouse.chipNumber,
            required: true,
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              const newState = {...formState};
              newState.groups[groupIdx].mice[index].chipNumber = Number(e.target.value);
              setFormState(newState);
            },
          },
        ])}
        <label htmlFor={`${groupNumber.id}-mouse-${index}-gender  *`}>Gender</label>
        <select
          name={`${groupNumber.id}-mouse-${index}-gender`}
          id={`${groupNumber.id}-mouse-${index}-gender`}
          defaultValue={mouse.gender ?? ''}
          required
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const newState = {...formState};
            newState.groups[groupIdx].mice[index].gender = e.target.value as 'MALE' | 'FEMALE';
            setFormState(newState);
          }}
        >
          <option value="">Select</option> <option value="FEMALE">Female</option> <option value="MALE">Male</option>
        </select>
        {InputGenerator([
          {
            label: 'Geno Type',
            name: `${groupNumber.id}-mouse-${index}-genoType`,
            id: `${groupNumber.id}-mouse-${index}-genoType`,
            type: 'text',
            defaultValue: mouse.genoType,
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              const newState = {...formState};
              newState.groups[groupIdx].mice[index].genoType = e.target.value;
              setFormState(newState);
            },
          },
        ])}
        {mouse.id && <button onClick={() => setMouseDeceased(mouse.id, true)}>Mark as deceased</button>}
      </fieldset>
    ));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.handleSubmit(formState);
      }}
    >
      {InputGenerator([
        {
          label: 'Name',
          name: 'name',
          id: 'name',
          type: 'text',
          defaultValue: formState.name,
          required: true,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            const newState = {...formState};
            newState[e.target.name] = e.target.value;
            setFormState(newState);
          },
        },
        {
          label: 'ID',
          name: 'displayId',
          id: 'displayId',
          type: 'text',
          defaultValue: formState.displayId,
          required: true,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            const newState = {...formState};
            newState[e.target.name] = e.target.value;
            setFormState(newState);
          },
        },
      ])}
      {formState.groups?.length > 0 && (
        <>
          <h2>Groups</h2>
          {formState.groups.map((group, idx) => (
            <div key={`group-${group.id ?? idx}`}>
              <h3>
                Group {group.groupNumber} - {group.mice?.length ?? 0} subjects
              </h3>
              {group.mice?.length > 0 && (
                <>
                  <h2>Subjects</h2>
                  {renderMiceFormFields(group.groupNumber)}
                </>
              )}
              <div>
                {(!group.mice || group.mice?.length < 1) && 'There are no subjects in this group.'}
                <button type="button" onClick={() => addEmptyMouseFormField(group.groupNumber)}>
                  Add new subject to group {group.groupNumber}
                </button>
              </div>
            </div>
          ))}
        </>
      )}
      <div>
        {(!formState.groups || formState.groups?.length < 1) && 'There are no groups in this experiment.'}
        <button type="button" onClick={() => addEmptyGroup(formState.groups ? formState.groups.length + 1 : 1)}>
          Create a new group
        </button>
      </div>

      <Link href={props.cancelURL}>
        <button>Cancel</button>
      </Link>
      <button type="submit">{props.experiment?.id ? 'Update experiment' : 'Create experiment'}</button>
    </form>
  );
};

export default ExperimentCreateUpdateForm;
