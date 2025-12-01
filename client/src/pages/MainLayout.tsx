import React from 'react';
import Sidebar from '../components/sidebar/Sidebar';

// npm install react-icons
// Inline styles for now, will be in CSS later

export default function MainLayout() {

    const layoutStyle: React.CSSProperties = {
        display: 'flex',
        position: 'fixed',
        top: 32,
        left: 0,
        width: '100%',
        height: '100%',
        margin: 0
    };

    const mainStyle: React.CSSProperties = {
        flex: 1,
        padding: '16px',
        //backgroundColor: 'white',
        backgroundColor: '#202020',
        height: '100%'
    };

    return (
        <div style={layoutStyle}>

            <Sidebar />

            <div style={mainStyle}>
                <p>This is main content!</p>
                <p>This is main content!</p>
                <p>This is main content!</p>
                <p>This is main content!</p>
            </div>
        </div>
    );
}
