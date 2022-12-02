import { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDialogState, Dialog, DialogDisclosure } from 'ariakit';
import { Heart as HeartIcon } from '@styled-icons/boxicons-regular/Heart';
import { Heart as HeartSolidIcon } from '@styled-icons/boxicons-solid/Heart';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import Button from '@components/Button';
import Input from '@components/Input';
import Element from '@components/Element';
import { slugify } from '@helpers/utils';

const StyledHeartIcon = styled(HeartIcon)`
  color: #222;
  height: 16px;
`;

const StyledHeartSolidIcon = styled(HeartSolidIcon)`
  color: red;
  height: 16px;
`;

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
    font-weight: 700;

    ${StyledHeartIcon} {
      color: #dc143c;
    }
  }
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
    font-weight: 700;
  }
`;

function SaveButton({ item, type, saved, hideLabel, onChange, ...props }) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [listFormVisible, setListFormVisible] = useState(false);
  const dialog = useDialogState();
  const isFirstRender = useRef(true);
  const { data: session } = useSession();

  const triggerOnChange = () => {
    if (typeof onChange === 'function') {
      onChange(
        lists.some((list) => list.items.some((it) => it.uri === item['@id'] && it.type === type))
      );
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    triggerOnChange();
  }, [lists]);

  const loadLists = async () => {
    setLoading(true);

    const loadedLists = await (await fetch('/api/profile/lists')).json();

    setLists(loadedLists);
    setLoading(false);

    // Show new list form if the user has no lists yet
    if (!listFormVisible) {
      setListFormVisible(loadedLists.length === 0);
    }

    return loadedLists;
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

  const onClick = useCallback(
    (event) => {
      if (!session) {
        signIn();
        event.preventDefault();
        return;
      }
      loadLists(event);
    },
    [session]
  );

  return (
    <div>
      <StyledDialogDisclosure {...props} onClick={onClick} state={dialog}>
        {saved ? <StyledHeartSolidIcon /> : <StyledHeartIcon />}
        {!hideLabel && (
          <StyledLabel>{saved ? t('saveButton.saved') : t('saveButton.save')}</StyledLabel>
        )}
      </StyledDialogDisclosure>
      <StyledDialog
        state={dialog}
        modal
        aria-label={t('saveButton.title')}
        backdrop
        backdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            width: '100%',
            height: '100%',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <h2>{t('saveButton.title')}</h2>
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
                placeholder={t('saveButton.labels.listName')}
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
                  {t('buttons.cancel')}
                </Button>
                <Button type="button" primary onClick={createListWithItem}>
                  {saved ? t('saveButton.saved') : t('saveButton.save')}
                </Button>
              </Element>
            </form>
          ) : (
            <Button type="button" primary onClick={() => setListFormVisible(true)}>
              {t('saveButton.createButton')}
            </Button>
          )}
        </Element>
        {loading ? (
          <p>{t('saveButton.loading')}</p>
        ) : (
          <StyledList>
            {lists.map((list) => {
              const isItemInList = list.items.some(
                (it) => it.uri === item['@id'] && it.type === type
              );
              return (
                <StyledItem key={list._id}>
                  <Element
                    flex="1"
                    onClick={() => (isItemInList ? removeFromList(list) : addToList(list))}
                  >
                    {isItemInList ? <StyledHeartSolidIcon /> : <StyledHeartIcon />}
                    <StyledLabel>{list.name}</StyledLabel>
                  </Element>
                  <Element marginLeft="auto">
                    <Link href={`/lists/${slugify(list.name)}-${list._id}`} passHref>
                      <Button primary>{t('common:profile.lists.open')}</Button>
                    </Link>
                  </Element>
                </StyledItem>
              );
            })}
          </StyledList>
        )}
      </StyledDialog>
    </div>
  );
}

export default SaveButton;
