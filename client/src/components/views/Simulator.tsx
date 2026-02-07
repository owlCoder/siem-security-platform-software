import { ISimulatorAPI } from "../../api/simulator/ISimulatorAPI";
import { SimulationPanel } from "../simulator/SimulationPanel";

type SimulatorProps = {
  simulatorApi: ISimulatorAPI;
};

export default function Simulator({ simulatorApi }: SimulatorProps) {
  return (
    <div className="p-6 flex flex-col gap-6">

      <div className="flex flex-col justify-start items-stretch rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">

        <h2 className="text-white text-lg font-semibold mb-6">
          Simulator
        </h2>

        {/* KLJUČ: max width + centar + spacing */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[1200px]">
            <SimulationPanel simulatorApi={simulatorApi} />
          </div>
        </div>

      </div>

    </div>
  );

}
