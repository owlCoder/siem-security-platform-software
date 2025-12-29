import React, { useRef } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FiDownload } from "react-icons/fi";
import { EventDistributionProps } from "../../types/props/statistics/EventDistributionProps";

export default function EventDistribution({ data }: EventDistributionProps) {
  /* =======================
     DATA
     ======================= */
  const chartData = [
    { name: "Notifications", value: data.notifications, color: "#00d492" },
    { name: "Warnings", value: data.warnings, color: "#00bc7d" },
    { name: "Errors", value: data.errors, color: "#007a55" },
  ];

  /* =======================
     PDF EXPORT
     ======================= */
  const printRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = async () => {
    if (!printRef.current) return;

    const bg =
      window.getComputedStyle(printRef.current).backgroundColor || "#ffffff";

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      backgroundColor: bg,
    });

    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

    const margin = 10;
    let cursorY = margin;

    doc.setFontSize(14);
    doc.text("Event distribution", margin, cursorY + 6);
    cursorY += 10;

    const imgProps = (doc as any).getImageProperties(imgData);
    const pdfImgW = doc.internal.pageSize.getWidth() - margin * 2;
    const pdfImgH = (imgProps.height * pdfImgW) / imgProps.width;

    doc.addImage(imgData, "PNG", margin, cursorY, pdfImgW, pdfImgH);
    doc.save("event-distribution.pdf");
  };

  /* =======================
     RENDER
     ======================= */
  return (
    <div ref={printRef}>
      {/* HEADER */}
      <div className="flex justify-between items-center m-4!">
        <span className="text-white text-lg font-semibold">
          Event distribution
        </span>

        <button
          onClick={handleDownload}
          className="px-4! py-2! rounded-[10px]! bg-[#007a55] transition-all duration-200"
          title="Download chart"
        >
          <FiDownload size={18} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex h-[350px] items-center gap-12 p-6 pr-12!">
        {/* PIE */}
        <div className="h-full w-[55%]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={112}
                labelLine={false}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <div className="flex w-[45%] max-w-[380px] flex-col gap-4">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="
                flex items-center justify-between
                bg-[#313338]
                rounded-[14px]
                px-5! py-3!
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-5 w-5 rounded-md"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-base font-semibold text-white">
                  {item.name}
                </span>
              </div>

              <span className="text-sm font-semibold text-[#c5c5c5]">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
