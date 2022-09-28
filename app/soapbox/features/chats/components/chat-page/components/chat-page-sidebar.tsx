import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { CardTitle, HStack, IconButton, Stack } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useDebounce, useFeatures } from 'soapbox/hooks';
import { IChat } from 'soapbox/queries/chats';

import ChatList from '../../chat-list';
import ChatSearchInput from '../../chat-search-input';

const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Messages' },
});

const ChatPageSidebar = () => {
  const intl = useIntl();
  const history = useHistory();
  const features = useFeatures();

  const [search, setSearch] = useState('');
  const { setChat } = useChatContext();

  const debouncedSearch = useDebounce(search, 300);

  const handleClickChat = (chat: IChat) => {
    setChat(chat);
    history.push(`/chats/${chat.id}`);
  };

  return (
    <Stack space={4} className='h-full'>
      <Stack space={4} className='px-4 pt-4'>
        <HStack alignItems='center' justifyContent='between'>
          <CardTitle title={intl.formatMessage(messages.title)} />

          <IconButton
            src={require('@tabler/icons/edit.svg')}
            iconClassName='w-5 h-5 text-gray-600'
          />
        </HStack>

        {features.chatsSearch && (
          <ChatSearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        )}
      </Stack>

      <Stack className='flex-grow h-full'>
        <ChatList
          onClickChat={handleClickChat}
          searchValue={debouncedSearch}
        />
      </Stack>
    </Stack>
  );
};

export default ChatPageSidebar;