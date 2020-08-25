import { useState } from 'react';
import styled from 'styled-components';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
import { useAllCallbacks } from 'reakit-utils';
import { Heart as HeartIcon } from '@styled-icons/boxicons-regular/Heart';
import { Heart as HeartSolidIcon } from '@styled-icons/boxicons-solid/Heart';
import Button from '@components/Button';
import Input from '@components/Input';
import Element from '@components/Element';

const StyledDialog = styled(Dialog)`
  z-index: 2000;
  background-color: #fff;
  position: relative;
  margin-top: 64px;
  margin-bottom: 64px;
  margin-left: auto;
  margin-right: auto;
  max-width: 568px;
  width: 90vw;
  height: 60vh;
  overflow: visible;
  padding: 32px;
  display: flex;
  flex-direction: column;

  ${Input} {
    width: 100%;
  }
`;

const StyledDialogDisclosure = styled(DialogDisclosure)`
  appearance: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  display: flex;
  align-items: center;

  &:hover {
    font-weight: bold;
  }
`;

const StyledDialogBackdrop = styled(DialogBackdrop)`
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledHeartIcon = styled(HeartIcon)`
  color: #222;
  height: 16px;
`;

const StyledHeartSolidIcon = styled(HeartSolidIcon)`
  color: red;
  height: 16px;
`;

const StyledLabel = styled.span`
  padding-left: 0.6em;
`;

const StyledList = styled.ul`
  overflow: auto;
`;

const StyledItem = styled.li`
  padding: 16px 0;
  cursor: pointer;
  border-style: solid;
  border-color: #e1e4e8;
  border-bottom-width: 1px;
  transition: border-color 0.24s ease-in-out;
  display: flex;
  align-items: center;

  &:first-child {
    border-top-width: 1px;
  }

  &:hover {
    border-color: #ccc;
    font-weight: bold;
  }
`;

const SaveButton = ({ item, type, saved, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [listFormVisible, setListFormVisible] = useState(false);
  const dialog = useDialogState();

  const loadLists = async () => {
    setLoading(true);

    const loadedLists = await (await fetch('/api/profile/lists')).json();

    setLists(loadedLists);
    setLoading(false);

    // Show new list form if the user has no lists yet
    if (!listFormVisible) {
      setListFormVisible(loadedLists.length === 0);
    }

    if (typeof onChange === 'function') {
      onChange(
        loadedLists.some((list) =>
          list.items.some((it) => it.uri === item['@id'] && it.type === type)
        )
      );
    }
  };

  const addToList = async (list) => {
    await fetch(`/api/lists/${list._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        item: item['@id'],
        type,
      }),
    });
    await loadLists();
  };

  const removeFromList = async (list) => {
    await fetch(`/api/lists/${list._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        item: item['@id'],
        type,
      }),
    });
    await loadLists();
  };

  const createListWithItem = async () => {
    // Create list
    const newList = await (
      await fetch('/api/profile/lists', {
        method: 'POST',
        body: JSON.stringify({
          name: newListName,
        }),
      })
    ).json();

    // Reset form
    setNewListName('');
    setListFormVisible(false);

    // Add the item to the new list
    await addToList(newList);

    // Reload the lists
    await loadLists();
  };

  return (
    <div>
      <StyledDialogDisclosure onClick={useAllCallbacks(loadLists, dialog.onClick)} {...dialog}>
        {saved ? <StyledHeartSolidIcon /> : <StyledHeartIcon />}
        <StyledLabel>Save</StyledLabel>
      </StyledDialogDisclosure>
      <StyledDialogBackdrop {...dialog}>
        <StyledDialog {...dialog} modal aria-label="Save to a list">
          <h2>Save to a list</h2>
          <Element marginY={12}>
            {listFormVisible ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createListWithItem();
                }}
              >
                <Input
                  type="text"
                  placeholder="List name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  autoFocus
                />
                <Element
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  marginY={12}
                >
                  <Button
                    type="button"
                    secondary
                    onClick={() => {
                      setNewListName('');
                      setListFormVisible(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" primary onClick={createListWithItem}>
                    Save
                  </Button>
                </Element>
              </form>
            ) : (
              <Button type="button" primary onClick={() => setListFormVisible(true)}>
                Create a new list
              </Button>
            )}
          </Element>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <StyledList>
              {lists.map((list) => {
                const isItemInList = list.items.some(
                  (it) => it.uri === item['@id'] && it.type === type
                );
                return (
                  <StyledItem
                    key={list._id}
                    onClick={() => (isItemInList ? removeFromList(list) : addToList(list))}
                  >
                    {isItemInList ? <StyledHeartSolidIcon /> : <StyledHeartIcon />}
                    <StyledLabel>{list.name}</StyledLabel>
                  </StyledItem>
                );
              })}
            </StyledList>
          )}
        </StyledDialog>
      </StyledDialogBackdrop>
    </div>
  );
};

export default SaveButton;
