import React from "react";
import { ArchiveVolumeDTO } from "../../models/storage/ArchiveVolumeDTO";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type ArchiveVolumeProps = {
    data: ArchiveVolumeDTO[];
    period: "daily" | "monthly" | "yearly";
    onPeriodChange: (period: "daily" | "monthly" | "yearly") => void;
};

export default function ArchiveVolume({ data, period, onPeriodChange }: ArchiveVolumeProps){
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        padding: '16px'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
    };

    const switchContainerStyle: React.CSSProperties = {
        display: 'flex',
        gap: '12px'
    };

    const switchButtonStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '8px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: isActive ? '#9978d4' : '#313338',
        color: '#ffffff',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.2s ease'
    });

    const chartContainerStyle: React.CSSProperties = {
        width: '100%',
        height: '350px',
        backgroundColor: '#2b2d31',
        borderRadius: '12px',
        padding: '20px'
    };

    const emptyStateStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '64px',
        color: '#c5c5c5',
        fontSize: '14px'
    };
    
    const CustomTooltip = ({active, payload}: any) => {
        if(active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: '#1e1f22',
                    border: '1px solid #313338',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#ffffff'
                }}>
                    <p style={{margin: 0, fontSize: '14px', fontWeight: 600}}>
                        {payload[0].payload.label}
                    </p>
                    <p style={{margin: '4px 0 0 0', fontSize: '14px', fontWeight: '#0078d4'}}>
                        {payload[0].value} MB
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={switchContainerStyle}>
                    <button
                        style={switchButtonStyle(period === "daily")}
                        onClick={() => onPeriodChange("daily")}>
                            Daily
                    </button>
                    <button
                        style={switchButtonStyle(period === "monthly")}
                        onClick={() => onPeriodChange("monthly")}>
                            Monthly
                    </button>
                    <button
                        style={switchButtonStyle(period === "yearly")}
                        onClick={() => onPeriodChange("yearly")}>
                            Yearly
                    </button>
                </div>
            </div>

            {data.length > 0 ? (
                <div style={chartContainerStyle}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#313338"/>
                            <XAxis
                                dataKey="label"
                                stroke="#c5c5c5"
                                style={{fontSize: '12px'}}
                            />
                            <YAxis
                                type="number"
                                stroke="#c5c5c5"
                                label={{value: 'MB', angle: -90, position: 'insideLeft', fill: '#c5c5c5'}}
                            />
                            <Tooltip content={<CustomTooltip/>} cursor={{fill: 'rgba(0, 120, 212, 0.1)'}}/>
                            <Bar
                                dataKey="size"
                                fill="#0078d4"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={80}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div style={emptyStateStyle}>
                    No archive volume data available
                </div>
            )}
        </div>
    );
}