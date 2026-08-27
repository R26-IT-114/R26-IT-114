import turtle from "../assets/New folder/turtulenew.png";
import fish from "../assets/New folder/fishnew.png";
import starfish from "../assets/New folder/starfishnew.png";

import shell from "../assets/New folder/shells2.png";
import crab from "../assets/New folder/crabnew.png";
import octopus from "../assets/New folder/octupusnew.png";

export const puzzleLevels = [
  {
    level: 1,
    previewTime: 5,
    pieces: 4,

    rounds: [
      {
        id: "turtle",
        image: turtle,
        label: "Turtle",
      },
      {
        id: "starfish",
        image: starfish,
        label: "Starfish",
      },
      {
        id: "fish",
        image: fish,
        label: "Fish",
      },
    ],
  },

  {
    level: 2,
    previewTime: 3,
    pieces: 6,

    rounds: [
      {
        id: "shell",
        image: shell,
        label: "Shell",
      },
      {
        id: "crab",
        image: crab,
        label: "Crab",
      },
      {
        id: "octopus",
        image: octopus,
        label: "Octopus",
      },
    ],
  },
];