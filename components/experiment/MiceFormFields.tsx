/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react';
import {InputGenerator} from 'components/InputGenerator';
import {FormikProps, useFormikContext} from 'formik';
import {FC, ChangeEvent} from 'react';
import {Card, Dropdown} from 'react-bootstrap';
import {FiMoreVertical} from 'react-icons/fi';
import {to_yyyyMMdd} from 'utils';
import {Experiment, Group, Mouse, WithPartialGroups, WithPartialMice} from 'types';

// Just making TS happy intermediately
type MiceFormFieldProps = {
  index: number;
  groupIdx: number;
  setMiceToDeleteAfterSave: React.Dispatch<React.SetStateAction<string[]>>;
  miceToDeleteAfterSave: string[];
  formik: FormikProps<Experiment>;
};

export const MiceFormFields: FC<MiceFormFieldProps> = ({
  index,
  groupIdx,
  setMiceToDeleteAfterSave,
  miceToDeleteAfterSave,
  formik,
}) => {
  const formikMouse = formik.values.groups[groupIdx].mice[index];
  const formikMouseSelector = `groups[${groupIdx}].mice[${index}]`;
  return (
    <Card
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
              Mouse {formikMouse.mouseNumber ?? index + 1}
              {!!formikMouse.deceasedAt && ' 💀'}
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
                {formikMouse.id && (
                  <>
                    <Dropdown.Item
                      onClick={() => {
                        formik.setFieldValue(
                          `${formikMouseSelector}.deceasedAt`,
                          formikMouse.deceasedAt ? null : new Date()
                        );
                      }}
                    >
                      {formikMouse.deceasedAt ? '🐭 Mark as alive' : '💀 Mark as deceased'}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                  </>
                )}
                <Dropdown.Item
                  onClick={() => {
                    formik.setFieldValue(
                      `groups[${groupIdx}].mice
                    `,
                      formik.values.groups[groupIdx].mice.filter((_, i) => i !== index)
                    );
                    if (formikMouse.id) {
                      // Delete mouse from database
                      setMiceToDeleteAfterSave([...miceToDeleteAfterSave, formikMouse.id]);
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
                name: `${formikMouseSelector}.pyratId`,
                id: `${formikMouseSelector}.pyratId`,
                value: formikMouse.pyratId,
                type: 'text',
                required: true,
                onChange: formik.handleChange,
              },
              {
                label: 'Mouse Nr*',
                name: `${formikMouseSelector}.mouseNumber`,
                id: `${formikMouseSelector}.mouseNumber`,
                value: formikMouse.mouseNumber,
                type: 'number',
                required: true,
                onChange: formik.handleChange,
              },
              {
                label: 'Chip Nr*',
                name: `${formikMouseSelector}.chipNumber`,
                id: `${formikMouseSelector}.chipNumber`,
                value: formikMouse.chipNumber,
                type: 'number',
                required: true,
                onChange: formik.handleChange,
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
              <label htmlFor={`${formikMouseSelector}.gender`}>Gender*</label>
              <select
                name={`${formikMouseSelector}.gender`}
                id={`${formikMouseSelector}.gender`}
                value={formikMouse.gender}
                required
                onChange={formik.handleChange}
              >
                <option value="">Select</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
              </select>
            </div>
            {InputGenerator([
              {
                label: 'Geno Type',
                name: `${formikMouseSelector}.genoType`,
                id: `${formikMouseSelector}.genoType`,
                type: 'text',
                value: formikMouse.genoType,
                onChange: formik.handleChange,
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
                name: `${formikMouseSelector}.surgeryDate`,
                id: `${formikMouseSelector}.surgeryDate`,
                type: 'date',
                required: false,
                value: formikMouse.surgeryDate ? to_yyyyMMdd(formikMouse.surgeryDate) : '',
                onChange: formik.handleChange,
              },
            ])}
          </div>
        </fieldset>
      </Card.Body>
    </Card>
  );
};
