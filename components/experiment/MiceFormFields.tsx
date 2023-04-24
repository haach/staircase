/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react';
import {InputGenerator} from 'components/InputGenerator';
import {useFormikContext} from 'formik';
import {FC, ChangeEvent} from 'react';
import {Card, Dropdown} from 'react-bootstrap';
import {FiMoreVertical} from 'react-icons/fi';
import {toYYYYMMDD} from 'utils';
import {Experiment, Group, Mouse, WithPartialGroups, WithPartialMice} from 'types';

// Just making TS happy intermediately
type MiceFormFieldProps = {
  mouse: Partial<Mouse>;
  index: number;
  groupIdx: number;
  group: Partial<WithPartialMice<Group>>;
  formState: Partial<WithPartialGroups<Experiment>>;
  setFormState: React.Dispatch<React.SetStateAction<Partial<WithPartialGroups<Experiment>>>>;
  setMiceToDeleteAfterSave: React.Dispatch<React.SetStateAction<string[]>>;
  miceToDeleteAfterSave: string[];
};

export const MiceFormFields: FC<MiceFormFieldProps> = ({
  mouse,
  index,
  groupIdx,
  group,
  formState,
  setFormState,
  setMiceToDeleteAfterSave,
  miceToDeleteAfterSave,
}) => {
  return (
    <Card
      key={`${group.id}-${mouse.id}-${index}`}
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
                name: `${group.id}-mouse-${index}-pyratId`,
                id: `${group.id}-mouse-${index}-pyratId`,
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
                name: `${group.id}-mouse-${index}-mouseNumber`,
                id: `${group.id}-mouse-${index}-mouseNumber`,
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
                name: `${group.id}-mouse-${index}-chipNumber`,
                id: `${group.id}-mouse-${index}-chipNumber`,
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
              <label htmlFor={`${group.id}-mouse-${index}-gender`}>Gender*</label>
              <select
                name={`${group.id}-mouse-${index}-gender`}
                id={`${group.id}-mouse-${index}-gender`}
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
                name: `${group.id}-mouse-${index}-genoType`,
                id: `${group.id}-mouse-${index}-genoType`,
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
                name: `${group.id}-mouse-${index}-surgeryDate`,
                id: `${group.id}-mouse-${index}-surgeryDate`,
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
  );
};
