import { createAsyncThunk } from '@reduxjs/toolkit';
import get from 'lodash/get';
import { gte } from 'semver';

import KVStore from 'soapbox/storage/kv_store';
import { RootState } from 'soapbox/store';
import { getAuthUserUrl } from 'soapbox/utils/auth';
import { parseVersion } from 'soapbox/utils/features';

import api from '../api';

const getMeUrl = (state: RootState) => {
  const me = state.me;
  return state.accounts.getIn([me, 'url']);
};

/** Figure out the appropriate instance to fetch depending on the state */
export const getHost = (state: RootState) => {
  const accountUrl = getMeUrl(state) || getAuthUserUrl(state);

  try {
    return new URL(accountUrl).host;
  } catch {
    return null;
  }
};

export const rememberInstance = createAsyncThunk(
  'instance/remember',
  async(host: string) => {
    return await KVStore.getItemOrError(`instance:${host}`);
  },
);

/** We may need to fetch nodeinfo on Pleroma < 2.1 */
const needsNodeinfo = (instance: Record<string, any>): boolean => {
  const v = parseVersion(get(instance, 'version'));
  return v.software === 'Pleroma' && !get(instance, ['pleroma', 'metadata']);
};

/** Mastodon exposes features availabiliy under /api/v2/instance since 4.0.0 */
const supportsInstanceV2 = (instance: Record<string, any>): boolean => {
  const v = parseVersion(get(instance, 'version'));
  return v.software === 'Mastodon' && gte(v.compatVersion, '4.0.0');
};

export const fetchInstance = createAsyncThunk<void, void, { state: RootState }>(
  'instance/fetch',
  async(_arg, { dispatch, getState, rejectWithValue }) => {
    try {
      const { data: instance } = await api(getState).get('/api/v1/instance');
      if (needsNodeinfo(instance)) {
        dispatch(fetchNodeinfo());
      }
      if (supportsInstanceV2(instance)) {
        dispatch(fetchInstanceV2());
      }
      return instance;
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

/** Tries to remember the instance from browser storage before fetching it */
export const loadInstance = createAsyncThunk<void, void, { state: RootState }>(
  'instance/load',
  async(_arg, { dispatch, getState }) => {
    const host = getHost(getState());
    await Promise.all([
      dispatch(rememberInstance(host || '')),
      dispatch(fetchInstance()),
    ]);
  },
);

export const fetchInstanceV2 = createAsyncThunk<void, void, { state: RootState }>(
  'nodeinfo/fetch',
  async(_arg, { getState }) => {
    const { data: instance } = await api(getState).get('/api/v2/instance');
    return instance;
  },
);

export const fetchNodeinfo = createAsyncThunk<void, void, { state: RootState }>(
  'nodeinfo/fetch',
  async(_arg, { getState }) => await api(getState).get('/nodeinfo/2.1.json'),
);
