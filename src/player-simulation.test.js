import { jest } from '@jest/globals';
import {
  PlayerSim,
  ItemFarmerSimulation,
  ItemChaserSimulation,
} from './player-simulation';
import { BaseModelSimulation } from './drop-simulation';

function testSetupGuaranteeDrop() {
  jest.spyOn(Math, 'random').mockReturnValue(0);
}

function testSetupGuaranteeNoDrop() {
  jest.spyOn(Math, 'random').mockReturnValue(1);
}

describe('PlayerSimulation', () => {
  describe('addItem', () => {
    it('should add an item drop simulator to the player', () => {
      const player = new PlayerSim();
      const item = {
        name: 'item',
        dropRate: {
          num: 1,
          denom: 128,
        },
        model: BaseModelSimulation,
      };
      player.addItem(item);
      expect(player.items).toContain(item);
    });
  });

  describe('getResults', () => {
    it('should return the results of the specified item', () => {
      const player = new PlayerSim();
      const item = {
        name: 'item',
        dropRate: {
          num: 1,
          denom: 128,
        },
        model: BaseModelSimulation,
      };
      player.addItem(item);
      testSetupGuaranteeDrop();
      player.simulateKill('item');
      expect(player.getResults('item').killCount).toBe(1);
      expect(player.getResults('item').dropCount).toBe(1);
    });
  });

  describe('getRecords', () => {
    it('should return the results of the specified item', () => {
      const player = new PlayerSim();
      const item = {
        name: 'item',
        dropRate: {
          num: 1,
          denom: 128,
        },
        model: BaseModelSimulation,
      };
      player.addItem(item);
      testSetupGuaranteeNoDrop();
      player.simulateKill('item', 10);
      testSetupGuaranteeDrop();
      player.simulateKill('item', 1);
      expect(player.getRecords('item').dryStreaks[0]).toBe(10);
      expect(player.getRecords('item').dropLog).toHaveLength(1);
    });
  });

  describe('simulateKill', () => {
    it('should simulate a kill for the specified item', () => {
      const player = new PlayerSim();
      const item = {
        name: 'whip',
        dropRate: {
          num: 1,
          denom: 128,
        },
        model: BaseModelSimulation,
      };
      player.addItem(item);
      player.simulateKill('whip');
      expect(player.items[0].simulation.results.killCount).toBe(1);
    });

    it('should simulate the specified number of kills', () => {
      const player = new PlayerSim();
      const item = {
        name: 'whip',
        dropRate: {
          num: 1,
          denom: 128,
        },
        model: BaseModelSimulation,
      };
      player.addItem(item);
      player.simulateKill('whip', 100);
      expect(player.getResults('whip').killCount).toBe(100);
    });
  });
});

describe('ItemFarmerSimulation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('isSatisfied', () => {
    it('should always return false by default', () => {
      const farmer = new ItemFarmerSimulation();
      const item = {
        name: 'book',
        dropRate: {
          num: 1,
          denom: 10,
        },
        model: BaseModelSimulation,
      };
      testSetupGuaranteeDrop();
      farmer.addItem(item);
      farmer.simulateKill('book', 100);
      console.log(farmer.getResults('book'));
      expect(farmer.isSatisfied('book')).toBe(false);
    });

    it('should return true if the item has a set kill limit', () => {
      const farmer = new ItemFarmerSimulation();
      const item = {
        name: 'book',
        dropRate: {
          num: 1,
          denom: 10,
        },
        model: BaseModelSimulation,
      };
      farmer.addItem(item);
      farmer.setKillLimit('book', 100);
      farmer.simulateKill('book', 99);
      expect(farmer.isSatisfied('book')).toBe(false);
      farmer.simulateKill('book', 1);
      expect(farmer.isSatisfied('book')).toBe(true);
    });
  });
});

describe('ItemChaserSimulation', () => {
  describe('isSatisfied', () => {
    it('should return true only if the item has been received', () => {
      const chaser = new ItemChaserSimulation();
      const item = {
        name: 'staff',
        dropRate: {
          num: 1,
          denom: 10,
        },
        model: BaseModelSimulation,
      };
      chaser.addItem(item);
      testSetupGuaranteeNoDrop();
      chaser.simulateKill('staff', 30);
      expect(chaser.isSatisfied('staff')).toBe(false);
      testSetupGuaranteeDrop();
      chaser.simulateKill('staff', 1);
      expect(chaser.isSatisfied('staff')).toBe(true);
    });
  });

  describe('setTargetDropCount', () => {
    it('should set the target drop count for the item', () => {
      const chaser = new ItemChaserSimulation();
      const item = {
        name: 'staff',
        dropRate: {
          num: 1,
          denom: 10,
        },
        model: BaseModelSimulation,
      };
      chaser.addItem(item);
      chaser.setTargetDropCount('staff', 2);
      expect(chaser.getItem('staff').targetDropCount).toBe(2);
    });
  });
});
