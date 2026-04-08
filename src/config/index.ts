import deepMerge from "@tokenring-ai/utility/object/deepMerge";
import manager from "./agents/writing/manager.yaml" with {type: "yaml"};
import writer from "./agents/writing/writer.yaml" with {type: "yaml"};
import audio from "./audio.yaml" with {type: "yaml"};
import lifecycle from "./lifecycle.yaml" with {type: "yaml"};
import chat from "./chat.yaml" with {type: "yaml"};
import imageGeneration from "./imageGeneration.yaml" with {type: "yaml"};

export default deepMerge(
  //Agents
  manager,
  writer,

  //Other configs
  chat,
  imageGeneration,
  audio,
  lifecycle,
);