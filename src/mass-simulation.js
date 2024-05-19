import { ItemFarmerSimulation, ItemChaserSimulation } from './player-simulation';
class MassDropSimulation {
  constructor(model) {
    this.model = model;
    this.players = [];
  }

  addPlayer(type, count = 1) {
    const typeMap = {
      farmer: ItemFarmerSimulation,
      chaser: ItemChaserSimulation,
    };
    const playerSimulation = typeMap[type];
    for (let i = 0; i < count; i++) {
      this.players.push(new playerSimulation());
    }
  }

  addItem(item) {
    this.players.forEach((player) => {
      item.model = this.model;
      player.addItem(item);
    });
  }

  run(item, count = 1) {
    for (let i = 0; i < count; i++) {
      this.players.forEach((player) => {
        if (!player.isSatisfied(item)) {
          player.simulateKill(item);
        }
      });
    }
  }

  get playerCount() {
    return this.players.length;
  }
}

export { MassDropSimulation };
