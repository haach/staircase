/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react';
import {InputGenerator} from 'components/InputGenerator';
import Link from 'next/link';
import React, {ChangeEvent, useState} from 'react';
import {Button, Card, Dropdown} from 'react-bootstrap';
import {FiMoreVertical} from 'react-icons/fi';
import {GoPlus} from 'react-icons/go';
import {Experiment, Group, Mouse} from 'types';
import {toYYYYMMDD} from 'utils';

const deleteMouse = async (id: string) => {
  const res = await fetch('/api/mouse/delete', {
    method: 'POST',
    body: id,
  });
  if (!res.ok) {
    throw new Error('Error deleting mouse');
  }
  return res.json();
};

const deleteGroup = async (id: string) => {
  const res = await fetch('/api/group/delete', {
    method: 'POST',
    body: id,
  });
  if (!res.ok) {
    throw new Error('Error deleting group');
  }
  return res.json();
};

type Props = {
  experiment?: Experiment;
  cancelURL: string;
  handleSubmit(formState): void;
};

type WithPartialMice<T> = Omit<T, 'mice'> & {mice?: Array<Partial<Mouse>>};
type WithPartialGroups<T> = Omit<T, 'groups'> & {groups?: Array<Partial<WithPartialMice<Group>>>};

const ExperimentCreateUpdateForm: React.FC<Props> = (props) => {
  const [formState, setFormState] = useState<Partial<WithPartialGroups<Experiment>>>(
    props.experiment ?? {
      name: '',
    }
  );
  const [miceToDeleteAfterSave, setMiceToDeleteAfterSave] = useState<Array<string>>([]);
  const [groupsToDeleteAfterSave, setGroupsToDeleteAfterSave] = useState<Array<string>>([]);

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
        surgeryDate: prevMouse.surgeryDate,
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
      <Card
        key={`${groupNumber.id}-${mouse.id}-${index}`}
        css={css`
          flex: 1 1 auto;
        `}
      >
        <Card.Body>
          <fieldset
            css={css`
              display: flex;
              gap: 8px;
              flex-direction: column;
            `}
          >
            <div
              css={css`
                display: flex;
              `}
            >
              <legend>
                Mouse {mouse.mouseNumber ?? index + 1}
                {!!mouse.deceasedAt && ' 💀'}
              </legend>

              <Dropdown>
                <Dropdown.Toggle
                  size="sm"
                  css={css`
                    border: 1px solid #333;
                    background-color: transparent;
                    color: #333;
                    &:hover,
                    &:active {
                      border-color: #333 !important;
                      background-color: #eee !important;
                      color: #333 !important;
                    }
                    &::after {
                      display: none;
                    }
                  `}
                >
                  <FiMoreVertical />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {mouse.id && (
                    <>
                      <Dropdown.Item
                        onClick={() => {
                          const newState = {...formState};
                          newState.groups[groupIdx].mice[index] = {
                            ...mouse,
                            deceasedAt: mouse.deceasedAt ? null : new Date(),
                          };
                          setFormState(newState);
                        }}
                      >
                        {mouse.deceasedAt ? '🐭 Mark as alive' : '💀 Mark as deceased'}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}
                  <Dropdown.Item
                    onClick={() => {
                      const newState = {...formState};
                      newState.groups[groupIdx].mice.pop();
                      setFormState(newState);
                      if (mouse.id) {
                        // Delete mouse from database
                        setMiceToDeleteAfterSave([...miceToDeleteAfterSave, mouse.id]);
                      }
                    }}
                    css={css`
                      color: darkred;
                    `}
                  >
                    🗑 Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div
              css={css`
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
              `}
            >
              {InputGenerator([
                {
                  label: 'Pyrat ID*',
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
                  label: 'Mouse Nr*',
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
                  label: 'Chip Nr*',
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
            </div>

            <div
              css={css`
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 8px;
              `}
            >
              <div>
                <label htmlFor={`${groupNumber.id}-mouse-${index}-gender`}>Gender*</label>
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
                  <option value="">Select</option> <option value="FEMALE">Female</option>{' '}
                  <option value="MALE">Male</option>
                </select>
              </div>
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
            </div>

            <div
              css={css`
                display: grid;
                grid-template-columns: 1fr;
                gap: 8px;
              `}
            >
              {InputGenerator([
                {
                  label: 'Surgery date',
                  name: `${groupNumber.id}-mouse-${index}-surgeryDate`,
                  id: `${groupNumber.id}-mouse-${index}-surgeryDate`,
                  type: 'date',
                  defaultValue: mouse.surgeryDate && toYYYYMMDD(mouse.surgeryDate),
                  required: false,
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                    const newState = {...formState};
                    newState.groups[groupIdx].mice[index].surgeryDate = new Date(e.target.value);
                    setFormState(newState);
                  },
                },
              ])}
            </div>
          </fieldset>
        </Card.Body>
      </Card>
    ));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        miceToDeleteAfterSave.forEach((mouseId) => {
          deleteMouse(mouseId);
        });
        groupsToDeleteAfterSave.forEach((groupId) => {
          deleteGroup(groupId);
        });
        props.handleSubmit(formState);
      }}
      css={css`
        display: flex;
        flex-direction: column;
        gap: 16px;
      `}
    >
      <div
        css={css`
          display: flex;
          gap: 16px;
        `}
      >
        {InputGenerator([
          {
            label: 'Name*',
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
            label: 'ID*',
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
      </div>

      <h2>Groups</h2>
      {formState.groups?.length > 0 && (
        <>
          {formState.groups.map((group, idx) => (
            <div
              key={`group-${group.id ?? idx}`}
              css={css`
                display: flex;
                gap: 8px;
                flex-direction: column;
              `}
            >
              <div css={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <h3>
                  Group {group.groupNumber} - {group.mice?.length ?? 0} subjects
                </h3>
                <div
                  css={css`
                    display: flex;
                    gap: 8px;
                  `}
                >
                  <Button onClick={() => addEmptyMouseFormField(group.groupNumber)} size="sm">
                    <GoPlus /> Add subject
                  </Button>

                  <Dropdown>
                    <Dropdown.Toggle
                      size="sm"
                      css={css`
                        border: 1px solid #333;
                        background-color: transparent;
                        color: #333;
                        &:hover,
                        &:active {
                          border-color: #333 !important;
                          background-color: #eee !important;
                          color: #333 !important;
                        }
                        &::after {
                          display: none;
                        }
                      `}
                    >
                      <FiMoreVertical />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          const newState = {...formState};
                          newState.groups.splice(idx, 1);
                          setFormState(newState);
                          if (group.id) {
                            // Delete group from database
                            setGroupsToDeleteAfterSave([...groupsToDeleteAfterSave, group.id]);
                          }
                        }}
                        css={css`
                          color: darkred;
                        `}
                      >
                        🗑 Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
              <div
                css={css`
                  display: grid;
                  grid-template-columns: repeat(1, 1fr);
                  gap: 16px;
                  @media (min-width: 440px) {
                    grid-template-columns: repeat(2, 1fr);
                  }
                  @media (min-width: 992px) {
                    grid-template-columns: repeat(3, 1fr);
                  }
                  /* @media (min-width: 1200px) {
                    grid-template-columns: repeat(4, 1fr);
                  } */
                `}
              >
                {group.mice?.length > 0 && renderMiceFormFields(group.groupNumber)}
              </div>
            </div>
          ))}
        </>
      )}

      {(!formState.groups || formState.groups?.length < 1) && <p>There are no groups in this experiment</p>}
      <div>
        <Button
          size="sm"
          type="button"
          onClick={() => {
            addEmptyGroup(formState.groups ? formState.groups.length + 1 : 1);
          }}
        >
          Create a new group
        </Button>
      </div>

      <div css={{display: 'flex', alignContent: 'center', justifyContent: 'end', gap: '8px'}}>
        <Link href={props.cancelURL}>
          <Button variant="danger" size="sm" type="button">
            Cancel
          </Button>
        </Link>
        <Button type="submit" size="sm">
          {props.experiment?.id ? 'Update experiment' : 'Create experiment'}
        </Button>
      </div>
    </form>
  );
};

export default ExperimentCreateUpdateForm;
