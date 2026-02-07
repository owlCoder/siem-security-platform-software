import { ISimulatorAPI } from "../../api/simulator/ISimulatorAPI";
import { SimulationPanel } from "../simulator/SimulationPanel";

type SimulatorProps = {
  simulatorApi: ISimulatorAPI;
};

export default function Simulator({ simulatorApi }: SimulatorProps) {
  return (
    <div className="p-6 flex flex-col gap-3">
      <div className="flex flex-col justify-center items-center min-h-[500px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-8">
        <div className="w-full mb-8">
          <h2 className="text-white text-lg font-semibold tracking-tight">
            Simulator
          </h2>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-[1200px]">
            <SimulationPanel simulatorApi={simulatorApi} />
          </div>
        </div>
      </div>
    </div>
  );
}
