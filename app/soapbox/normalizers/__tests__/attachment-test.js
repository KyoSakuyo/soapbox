import { Record as ImmutableRecord, fromJS } from 'immutable';

import { normalizeAttachment } from '../attachment';

describe('normalizeAttachment()', () => {
  it('adds base fields', () => {
    const attachment = fromJS({});
    const result = normalizeAttachment(attachment);

    expect(ImmutableRecord.isRecord(result)).toBe(true);
    expect(result.type).toEqual('unknown');
    expect(result.url).toEqual('');
  });

  it('infers preview_url from url', () => {
    const attachment = fromJS({ url: 'https://site.fedi/123.png' });
    const result = normalizeAttachment(attachment);

    expect(result.preview_url).toEqual('https://site.fedi/123.png');
  });
});
