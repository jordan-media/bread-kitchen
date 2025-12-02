import { useEffect, useState } from "react";
import { Link } from "react-router";    
import { useParams } from "react-router";

import g from '../global.module.css';

function Tape() {

    const { id } = useParams();
    
    // Query API Here

    return (
        <main className={g['container']}>
            <div className={g['grid-container']}>
                <div className={g['col-4']}>
                    IMAGE HERE
                </div>
                <div className={g['col-8']}>
                    <Link to="/" className={`${g['button']} ${g['small']}`}>&lt; Tapes</Link>
                    CONTENT HERE
                </div>
            </div>
        </main>
    );

}

export default Tape;