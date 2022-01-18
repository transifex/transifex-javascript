/* globals describe, it */

import { expect } from 'chai';
import { createNativeInstance } from '../src/index';

describe('Native instance', () => {
  it('updates child locale', async () => {
    const controller = createNativeInstance();
    const child = createNativeInstance();

    controller.cache.update('el', {});

    await controller.controllerOf(child);
    await controller.setCurrentLocale('el');

    expect(controller.getCurrentLocale()).to.equal('el');
    expect(child.getCurrentLocale()).to.equal('el');
  });

  it('updates child locale lazy', async () => {
    const controller = createNativeInstance();
    const child = createNativeInstance();

    controller.cache.update('el', {});

    await controller.setCurrentLocale('el');

    expect(controller.getCurrentLocale()).to.equal('el');
    expect(child.getCurrentLocale()).to.equal('');

    await controller.controllerOf(child);

    expect(child.getCurrentLocale()).to.equal('el');
  });

  it('updates child locale when not set', async () => {
    const controller = createNativeInstance();
    const child = createNativeInstance();

    controller.cache.update('el', {});
    child.cache.update('el', {});

    await controller.setCurrentLocale('el');
    await child.setCurrentLocale('el');

    expect(controller.getCurrentLocale()).to.equal('el');
    expect(child.getCurrentLocale()).to.equal('el');

    await controller.controllerOf(child);
    await controller.setCurrentLocale();

    expect(controller.getCurrentLocale()).to.equal('');
    expect(child.getCurrentLocale()).to.equal('');
  });

  it('throws when child reference is invalid', async () => {
    const controller = createNativeInstance();
    const child = createNativeInstance();

    let throws = false;
    try {
      await controller.controllerOf(controller);
    } catch (e) {
      throws = true;
    }
    expect(throws).to.equal(true);

    throws = false;
    await controller.controllerOf(child);
    try {
      await child.controllerOf(controller);
    } catch (e) {
      throws = true;
    }
    expect(throws).to.equal(true);
  });
});
