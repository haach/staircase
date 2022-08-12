import {InputGenerator} from 'components/InputGenerator';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {ChangeEvent, useState} from 'react';
import {Experiment, Mouse} from 'types';

type Props = {
  experiment?: Experiment;
  handleSubmit(formState): void;
};

const ExperimentCreateUpdateForm: React.FC<Props> = (props) => {
  const [formState, setFormState] = useState<Omit<Partial<Experiment>, 'mice'> & {mice?: Array<Partial<Mouse>>}>(
    props.experiment ?? {
      name: '',
    }
  );

  const addEmptyMouseFormField = () => {
    setFormState({
      ...formState,
      mice: [
        ...(formState.mice ?? []),
        formState.mice && formState.mice.length > 0
          ? {
              // Prefill with previous values
              pyratId: formState.mice[formState.mice.length - 1].pyratId ?? '',
              chipId: formState.mice[formState.mice.length - 1].chipId ?? 1,
              groupNumber: formState.mice[formState.mice.length - 1].groupNumber ?? 1,
              gender: formState.mice[formState.mice.length - 1].gender ?? undefined,
              genoType: formState.mice[formState.mice.length - 1].genoType ?? '',
            }
          : {
              // Prefill with minimum values for number fields
              chipId: 0,
              groupNumber: 0,
            },
      ],
    });
  };

  const miceFormFields = (formState.mice ?? []).map((mouse, index) => (
    <fieldset key={mouse.id + '-' + index}>
      <legend>Mouse {index + 1}</legend>
      {InputGenerator([
        {
          label: 'Pyrat ID *',
          name: `mouse-${index}-pyratId`,
          id: `mouse-${index}-pyratId`,
          type: 'text',
          defaultValue: mouse.pyratId,
          required: true,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            const newState = {...formState};
            newState.mice[index].pyratId = e.target.value;
            setFormState(newState);
          },
        },
        {
          label: 'Chip ID *',
          name: `mouse-${index}-chipId`,
          id: `mouse-${index}-chipId`,
          type: 'number',
          defaultValue: mouse.chipId,
          required: true,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            const newState = {...formState};
            newState.mice[index].chipId = Number(e.target.value);
            setFormState(newState);
          },
        },
        {
          label: 'Group number ',
          name: `mouse-${index}-groupNumber`,
          id: `mouse-${index}-groupNumber`,
          type: 'number',
          defaultValue: mouse.groupNumber ?? 0,
          required: true,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            const newState = {...formState};
            newState.mice[index].groupNumber = Number(e.target.value);
            setFormState(newState);
          },
        },
      ])}
      <label htmlFor={`mouse-${index}-gender  *`}>Gender</label>
      <select
        name={`mouse-${index}-gender`}
        id={`mouse-${index}-gender`}
        defaultValue={mouse.gender ?? ''}
        required
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const newState = {...formState};
          newState.mice[index].gender = e.target.value as 'MALE' | 'FEMALE';
          setFormState(newState);
        }}
      >
        <option value="">Select</option> <option value="FEMALE">Female</option> <option value="MALE">Male</option>
      </select>
      {InputGenerator([
        {
          label: 'Geno Type',
          name: `mouse-${index}-genoType`,
          id: `mouse-${index}-genoType`,
          type: 'text',
          defaultValue: mouse.genoType,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            const newState = {...formState};
            newState.mice[index].genoType = e.target.value;
            setFormState(newState);
          },
        },
      ])}
    </fieldset>
  ));

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
      ])}
      {/* {formState.mice?.length > 0 &&
              formState.mice.map((mouse, index) => (
                <div key={mouse.id} title={'Mouse ID: ' + mouse.id}>
                  Chip no. {mouse.chipId} - pyrat ID {mouse.pyratId} - Gender {mouse.gender} - Geno type{' '}
                  {mouse.genoType} - Last updated {mouse.updatedAt.toLocaleString()}{' '}
                  {mouse.deceasedAt && `- Deceased ${mouse.deceasedAt.toLocaleString()}`}
                </div>
              ))} */}
      {formState.mice?.length > 0 && miceFormFields}
      <div>
        {(!formState.mice || formState.mice?.length < 1) && 'There are no subjects in this experiment.'}
        <button type="button" onClick={() => addEmptyMouseFormField()}>
          Create a new subject
        </button>
      </div>
      <Link href={'/experiments'}>
        <button>Cancel</button>
      </Link>
      <button type="submit">{props.experiment?.id ? 'Update experiment' : 'Create experiment'}</button>
    </form>
  );
};

export default ExperimentCreateUpdateForm;
