import {InputGenerator} from 'components/InputGenerator';
import Layout from 'components/Layout';
import {experimentCreate} from 'pages/api/experimentCRUD';
import React, {ChangeEvent, useState} from 'react';

const ExperimentCreate: React.FC = () => {
  const handleSubmit = () => {
    experimentCreate(formState);
  };
  const [formState, setFormState] = useState<{name: string}>({name: ''});

  return (
    <Layout>
      <div className="page">
        <h1>New experiment</h1>
        <main>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {InputGenerator([
              {
                label: 'Name',
                name: 'name',
                id: 'name',
                type: 'text',
                required: true,
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                  const newState = {...formState};
                  newState[e.target.name] = e.target.value;
                  setFormState(newState);
                },
              },
            ])}
            <button type="submit">Create</button>
          </form>
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentCreate;
