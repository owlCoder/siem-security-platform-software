import { useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import Dashboard from '../components/views/Dashboard';
import Events from '../components/views/Events';
import Statistics from '../components/views/Statistics';
import Storage from '../components/views/Storage';
import Alert from '../components/views/Alerts';
import { MainLayoutProps } from '../types/props/pages/MainLayoutProps';

export default function MainLayout({ alertsAPI, parserAPI, queryAPI, storageAPI }: MainLayoutProps) {
    const [sideMenuPage, setSideMenuPage] = useState<number>(0);

    return (
        <div className='flex fixed top-10 left-0 right-5 bottom-10 gap-4'>
            <Sidebar setSideMenuPage={setSideMenuPage} />

            <div className='flex-1 p-4 bg-[#202020] h-full overflow-y-scroll'>
                {sideMenuPage === 0 && <Dashboard queryApi={queryAPI} storageApi={storageAPI} />}
                {sideMenuPage === 1 && <Events queryApi={queryAPI} parserApi={parserAPI} />}
                {sideMenuPage === 2 && <Statistics queryApi={queryAPI} storageApi={storageAPI} />}
                {sideMenuPage === 3 && <Storage storageApi={storageAPI} />}
                {sideMenuPage === 4 && <Alert alertsApi={alertsAPI} />}
            </div>
        </div>
    );
}
