/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react';
import {MiceFormFields} from 'components/experiment/MiceFormFields';
import {InputGenerator} from 'components/InputGenerator';
import {useFormik} from 'formik';
import Link from 'next/link';
import React, {useState} from 'react';
import {Button, Dropdown} from 'react-bootstrap';
import {FiMoreVertical} from 'react-icons/fi';
import {GoPlus} from 'react-icons/go';
import {Experiment, Group, WithPartialMice} from 'types';

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
  handleSubmit(values): void;
};

const ExperimentCreateUpdateForm: React.FC<Props> = (props) => {
  const [miceToDeleteAfterSave, setMiceToDeleteAfterSave] = useState<Array<string>>([]);
  const [groupsToDeleteAfterSave, setGroupsToDeleteAfterSave] = useState<Array<string>>([]);

  const addEmptyGroup = async () => {
    await formik.setFieldValue(`groups[${formik.values.groups.length ?? 0}]`, {
      groupNumber: formik.values.groups.length + 1,
      mice: [],
    });
  };

  const formik = useFormik({
    initialValues: {
      ...props.experiment,
    },
    onSubmit: (values) => {
      miceToDeleteAfterSave.forEach((mouseId) => {
        deleteMouse(mouseId);
      });
      groupsToDeleteAfterSave.forEach((groupId) => {
        deleteGroup(groupId);
      });
      props.handleSubmit(values);
    },
  });

  const addEmptyMouseFormField = (groupNumber) => {
    const groupIdx = groupNumber - 1;
    const group = formik.values.groups[groupIdx];
    const mice = group.mice || [];
    const prevMouse = mice[mice.length - 1] || {};

    formik.setFieldValue(`groups[${groupIdx}].mice[${mice.length}]`, {
      pyratId: prevMouse.pyratId ?? '',
      chipNumber: prevMouse.chipNumber ?? 1,
      mouseNumber: prevMouse.mouseNumber ?? 1,
      gender: prevMouse.gender ?? undefined,
      genoType: prevMouse.genoType ?? '',
      surgeryDate: prevMouse.surgeryDate,
    });
  };

  const renderMiceFormFields = (group: Partial<WithPartialMice<Group>>) => {
    const groupIdx = group.groupNumber - 1;
    const miceState = formik.values.groups[groupIdx].mice;
    if (!miceState.length) {
      return null;
    }
    return miceState.map((mouse, index) => (
      <MiceFormFields
        key={mouse.id ?? index}
        index={index}
        groupIdx={groupIdx}
        setMiceToDeleteAfterSave={setMiceToDeleteAfterSave}
        miceToDeleteAfterSave={miceToDeleteAfterSave}
        formik={formik}
      />
    ));
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
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
            required: true,
            value: formik.values.name,
            onChange: formik.handleChange,
          },
          {
            label: 'ID*',
            name: 'displayId',
            id: 'displayId',
            type: 'text',
            required: true,
            value: formik.values.displayId,
            onChange: formik.handleChange,
          },
        ])}
      </div>

      <h2>Groups</h2>
      {formik.values.groups?.length > 0 && (
        <>
          {formik.values.groups.map((group, idx) => (
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
                          formik.setFieldValue(
                            `groups[${idx}]`,
                            formik.values.groups.filter((_, index) => index !== idx)
                          );

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
                `}
              >
                {renderMiceFormFields(group)}
              </div>
            </div>
          ))}
        </>
      )}

      {(!formik.values.groups || formik.values.groups?.length < 1) && <p>There are no groups in this experiment</p>}

      <div>
        <Button
          size="sm"
          type="button"
          onClick={() => {
            addEmptyGroup();
          }}
        >
          Create a new group
        </Button>
      </div>

      <div css={{display: 'flex', alignContent: 'center', justifyContent: 'end', gap: '8px'}}>
        <Link href={props.cancelURL}>
          <Button
            variant="danger"
            size="sm"
            type="button"
            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
          >
            Cancel
          </Button>
        </Link>
        <Button type="submit" size="sm" disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}>
          {props.experiment?.id ? 'Update experiment' : 'Create experiment'}
        </Button>
      </div>
    </form>
  );
};

export default ExperimentCreateUpdateForm;
