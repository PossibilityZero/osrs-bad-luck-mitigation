import { jest } from '@jest/globals';
import { MassDropSimulation } from './mass-simulation';
import {
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

describe('MassDropSimulation', () => {
  describe('constructor', () => {
    it('should take a model as a parameter', () => {
      const model = BaseModelSimulation;
      const simulation = new MassDropSimulation(model);
    });
  });

  describe('addPlayer', () => {
    it('should add a player to the simulation', () => {
      const simulation = new MassDropSimulation(BaseModelSimulation);
      simulation.addPlayer('farmer', 1);
      expect(simulation.playerCount).toBe(1);
    });

    it('should add multiple players to the simulation', () => {
      const simulation = new MassDropSimulation(BaseModelSimulation);
      simulation.addPlayer('farmer', 2);
      simulation.addPlayer('chaser', 2);
      expect(simulation.playerCount).toBe(4);
    });
  });

  describe('addItem', () => {
    it('should add an item to each player', () => {
      const simulation = new MassDropSimulation(BaseModelSimulation);
      simulation.addPlayer('farmer', 100);
      const item = {
        name: 'item',
        dropRate: {
          num: 1,
          denom: 128,
        },
      };
      simulation.addItem(item);
      expect(simulation.players[0].items).toHaveLength(1);
    });
  });

  describe('run', () => {
    it('should run the simulation for each player', () => {
      const simulation = new MassDropSimulation(BaseModelSimulation);
      simulation.addPlayer('farmer', 100);
      const item = {
        name: 'sword',
        dropRate: {
          num: 1,
          denom: 128,
        },
      };
      simulation.addItem(item);
      simulation.run('sword', 100);
      expect(simulation.players[0].getResults('sword').killCount).toBe(100);
    });

    it('should only add kills for unsatisfied players', () => {
      const simulation = new MassDropSimulation(BaseModelSimulation);
      simulation.addPlayer('chaser', 1);
      simulation.addPlayer('farmer', 1);
      const item = {
        name: 'sword',
        dropRate: {
          num: 1,
          denom: 128,
        },
      };
      simulation.addItem(item);
      simulation.run('sword', 10);
      testSetupGuaranteeDrop();
      simulation.run('sword', 90);
      // chaser
      expect(simulation.players[0].getResults('sword').killCount).toBe(11);
      // farmer
      expect(simulation.players[1].getResults('sword').killCount).toBe(100);
    });
  });
});
