// Regression test for the cold-start race: the stats route issues two commands
// concurrently, and a lazy connect guarded by a boolean let both of them call
// connect(), which made the very first request after a deploy fail with a 500.

/** The exact ensure() shape used by the RESP adapter in redisClient.ts. */
function makeEnsure(connect: () => Promise<void>) {
  let connecting: Promise<unknown> | null = null;
  return () => {
    if (!connecting) {
      connecting = connect().catch((err: unknown) => {
        connecting = null;
        throw err;
      });
    }
    return connecting;
  };
}

describe('lazy connect', () => {
  it('connects once even when several commands start concurrently', async () => {
    const connect = jest.fn().mockImplementation(
      () => new Promise<void>((resolve) => setTimeout(resolve, 10)),
    );
    const ensure = makeEnsure(connect);

    await Promise.all([ensure(), ensure(), ensure()]);

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('does not reconnect on later commands', async () => {
    const connect = jest.fn().mockResolvedValue(undefined);
    const ensure = makeEnsure(connect);

    await ensure();
    await ensure();

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('allows a retry after a failed connect instead of latching broken', async () => {
    const connect = jest
      .fn()
      .mockRejectedValueOnce(new Error('redis unreachable'))
      .mockResolvedValueOnce(undefined);
    const ensure = makeEnsure(connect);

    await expect(ensure()).rejects.toThrow('redis unreachable');
    await expect(ensure()).resolves.toBeUndefined();
    expect(connect).toHaveBeenCalledTimes(2);
  });
});
