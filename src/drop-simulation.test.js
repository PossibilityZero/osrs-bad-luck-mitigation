import { jest } from '@jest/globals';
import {
  DropRateSimulation,
  BaseModelSimulation,
  SimpleBadLuckMitigationSimulation,
  FirstDropMitigationSimulation,
  CollectionLogAverageSimulation,
} from './drop-simulation';

function testSetupGuaranteeDrop() {
  jest.spyOn(Math, 'random').mockReturnValue(0);
}

function testSetupGuaranteeNoDrop() {
  jest.spyOn(Math, 'random').mockReturnValue(1);
}

describe('DropRateSimulation', () => {
  describe('constructor', () => {
    it('should take parameters containing droprate and model', () => {
      const params = { dropRate: 1 / 128, model: 'base' };
      const simulation = new DropRateSimulation(params);
    });
  });

  describe('run', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should run the simulation the specified number of times', () => {
      const params = { dropRate: 1 / 128, model: 'base' };
      const simulation = new DropRateSimulation(params);
      simulation.run(1);
      expect(simulation.results.killCount).toBe(1);
    });

    it('should keep track of the dry streak', () => {
      testSetupGuaranteeNoDrop();
      const params = { dropRate: 1 / 2 };
      const simulation = new DropRateSimulation(params);
      simulation.run(10);
      expect(simulation.results.killCount).toBe(10);
      expect(simulation.results.dropCount).toBe(0);
      expect(simulation.results.dryStreak).toBe(10);
    });
  });

  describe('records', () => {
    it('should provide a list of drops received by kill count', () => {
      const params = { dropRate: 1 / 10 };
      const simulation = new DropRateSimulation(params);
      // force a drop on the 30th and 61st kills
      testSetupGuaranteeNoDrop();
      simulation.run(29);
      testSetupGuaranteeDrop();
      simulation.run(1);
      testSetupGuaranteeNoDrop();
      simulation.run(30);
      testSetupGuaranteeDrop();
      simulation.run(1);
      expect(simulation.records.dropLog).toEqual([30, 61]);
    });

    it('should provide a list of dry streaks', () => {
      const params = { dropRate: 1 / 10 };
      const simulation = new DropRateSimulation(params);
      // force a drop on the 30th and 61st kills
      testSetupGuaranteeNoDrop();
      simulation.run(29);
      testSetupGuaranteeDrop();
      simulation.run(1);
      testSetupGuaranteeNoDrop();
      simulation.run(30);
      testSetupGuaranteeDrop();
      simulation.run(1);
      expect(simulation.records.dryStreaks).toEqual([29, 30]);
    });
  });
});

describe('BaseModelSimulation', () => {
  describe('constructor', () => {
    it('should take a drop rate as a parameter', () => {
      const params = { dropRate: 1 / 128 };
      const simulation = new BaseModelSimulation(params);
    });
  });

  describe('dropRate', () => {
    it('should be invariable regardless of kills or drops', () => {
      const params = { dropRate: 1 / 128 };
      const simulation = new BaseModelSimulation(params);
      testSetupGuaranteeNoDrop();
      simulation.run(1000);
      expect(simulation.dropRate).toBe(1 / 128);
    });
  });
});

describe('SimpleBadLuckMitigationSimulation', () => {
  describe('constructor', () => {
    it('should take a drop rate as a parameter', () => {
      const params = { dropRate: 1 / 128 };
      const simulation = new SimpleBadLuckMitigationSimulation(params);
    });
  });

  describe('dropRate', () => {
    it('should improve at the specified rate', () => {
      const initialDropRate = 1 / 10;
      const params = { dropRate: initialDropRate };
      const simulation = new SimpleBadLuckMitigationSimulation(params);
      testSetupGuaranteeNoDrop();
      simulation.run(19);
      expect(simulation.dropRate).toBe(initialDropRate);
      // bad luck mitigation kicks in at 2x the drop rate
      simulation.run(1);
      expect(simulation.dropRate).toBe(initialDropRate * 2);
      simulation.run(5);
      expect(simulation.dropRate).toBe(initialDropRate * 2.5);
    });
  });
});

describe('FirstDropMitigationSimulation', () => {
  describe('dropRate', () => {
    it('should improve at the specified rate', () => {
      const initialDropRate = 1 / 10;
      const params = { dropRate: initialDropRate };
      const simulation = new FirstDropMitigationSimulation(params);
      testSetupGuaranteeNoDrop();
      simulation.run(19);
      expect(simulation.dropRate).toBe(initialDropRate);
      // bad luck mitigation kicks in at 2x the drop rate
      simulation.run(1);
      expect(simulation.dropRate).toBe(initialDropRate * 2);
      simulation.run(5);
      expect(simulation.dropRate).toBe(initialDropRate * 2.5);
      testSetupGuaranteeDrop();
      simulation.run(1);
      // after the first drop, the drop rate should reset and stay constant
      testSetupGuaranteeNoDrop();
      simulation.run(100);
      expect(simulation.dropRate).toBe(initialDropRate);
    });
  });
});

describe('CollectionLogAverageSimulation', () => {
  describe('dropRate', () => {
    it('should improve at the specified rate', () => {
      const initialDropRate = 1 / 10;
      const params = { dropRate: initialDropRate };
      const simulation = new CollectionLogAverageSimulation(params);
      testSetupGuaranteeNoDrop();
      simulation.run(19);
      expect(simulation.dropRate).toBe(initialDropRate);
      // bad luck mitigation kicks in at 2x the drop rate
      simulation.run(1);
      expect(simulation.dropRate).toBe(initialDropRate * 2);
      simulation.run(5);
      expect(simulation.dropRate).toBe(initialDropRate * 2.5);
      testSetupGuaranteeDrop();
      simulation.run(1);
      // First drop at 26 kills. This is under the 2x threshold now,
      // so the drop rate should reset to the initial value.
      testSetupGuaranteeNoDrop();
      simulation.run(13);
      expect(simulation.dropRate).toBe(initialDropRate);
      // Once the total hits 40, we are at double drop rate again,
      // so bad luck mitigation kicks in.
      simulation.run(1);
      expect(simulation.dropRate).toBe(initialDropRate * 2);
    });
  });
});
