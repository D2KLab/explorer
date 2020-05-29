import { useState } from 'react';
import styled from 'styled-components';
import { useDialogState, Dialog, DialogDisclosure, DialogBackdrop } from 'reakit/Dialog';
import { useAllCallbacks } from 'reakit-utils';
import { Heart as HeartIcon } from '@styled-icons/boxicons-regular/Heart';
import { Heart as HeartSolidIcon } from '@styled-icons/boxicons-solid/Heart';
import Button from '@components/Button';
import Input from '@components/Input';

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
  overflow: visible;
  padding: 32px;

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

  &:hover {
    font-weight: bold;
  }
`;

const StyledDialogBackdrop = styled(DialogBackdrop)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0px;
  z-index: 999;
`;

const StyledHeartIcon = styled.span`
  color: #222;
  height: 16px;
`;

const StyledLabel = styled.span`
  padding-left: 0.6em;
`;

const StyledList = styled.ul`
  height: 50vh;
  overflow: auto;
`;

const StyledItem = styled.li`
  padding: 16px 0;
  cursor: pointer;
  border-style: solid;
  border-color: #e1e4e8;
  border-bottom-width: 1px;
  transition: border-color 0.24s ease-in-out;

  &:first-child {
    border-top-width: 1px;
  }

  &:hover {
    border-color: #ccc;
    font-weight: bold;
  }
`;

const SaveButton = ({ item }) => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [listFormVisible, setListFormVisible] = useState(false);
  const dialog = useDialogState();

  const loadLists = async () => {
    const res = await fetch('/api/profile/lists');
    const loadedLists = await res.json();

    setLists(loadedLists);

    // Show new list form if the user has no lists yet
    if (!listFormVisible) {
      setListFormVisible(loadedLists.length === 0);
    }
  };

  const addToList = async (list) => {
    await fetch(`/api/lists/${list._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        item: item['@id'],
      }),
    });
    await loadLists();
  };

  const removeFromList = async (list) => {
    await fetch(`/api/lists/${list._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        item: item['@id'],
      }),
    });
    await loadLists();
  };

  const createListWithItem = async () => {
    // Create list
    const res = await fetch('/api/profile/lists', {
      method: 'POST',
      body: JSON.stringify({
        name: newListName,
      }),
    });
    const newList = await res.json();

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
        <StyledHeartIcon as={HeartIcon} />
        <StyledLabel>Save</StyledLabel>
      </StyledDialogDisclosure>
      <StyledDialogBackdrop {...dialog}>
        <StyledDialog {...dialog} modal aria-label="Save to a list">
          <h2>Save to a list</h2>
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
              <Button
                type="button"
                onClick={() => {
                  setNewListName('');
                  setListFormVisible(false);
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={createListWithItem}>
                Save
              </Button>
            </form>
          ) : (
            <Button type="button" onClick={() => setListFormVisible(true)}>
              Create a new list
            </Button>
          )}
          <StyledList>
            {lists.map((list) => {
              const isItemInList = list.items.includes(item['@id']);
              return (
                <StyledItem
                  key={list._id}
                  onClick={() => (isItemInList ? removeFromList(list) : addToList(list))}
                >
                  <StyledHeartIcon as={isItemInList ? HeartSolidIcon : HeartIcon} />
                  <StyledLabel>{list.name}</StyledLabel>
                </StyledItem>
              );
            })}
          </StyledList>
        </StyledDialog>
      </StyledDialogBackdrop>
    </div>
  );
};

export default SaveButton;
