import { useKeyboardControls } from "@react-three/drei"
import useGame from "./stores/useGame"
import { useEffect, useRef } from "react"
import { addEffect } from "@react-three/fiber"


export default function Interface() {

    const timeRef = useRef()

    const restart = useGame((state) => state.restart)
    const phase = useGame((state) => state.phase)

    const forward = useKeyboardControls((state) => state.forward)
    const backward = useKeyboardControls((state) => state.backward)
    const leftward = useKeyboardControls((state) => state.leftward)
    const rightward = useKeyboardControls((state) => state.rightward)
    const jump = useKeyboardControls((state) => state.jump)

    useEffect(() => {

        const unsbscribeEffect =  addEffect(() => {
            const state = useGame.getState()

            let elapsedTime = 0
            if(state.phase === 'playing')
                elapsedTime = Date.now() - state.startTime
            else if(state.phase === 'ended')
                elapsedTime = state.endTime - state.startTime

            elapsedTime /= 1000
            elapsedTime = elapsedTime.toFixed(2)

            if(timeRef.current)
                timeRef.current.textContent = elapsedTime
        })

        return () => {
            unsbscribeEffect()
        }
    }, [])

    return <div className="interface">

        {/* Time */}
        <div ref={ timeRef } className="time"> 0.00 </div>

        {/* Restart */}
        { phase === 'ended' && <div className="restart" onClick={ restart }> Restart </div>  }

        {/* Controls */}
        <div className="controls">
            <div className="raw">
                <div className={ `key ${ forward ? 'active' : '' }` }></div>
            </div>
            <div className="raw">
                <div className={ `key ${ leftward ? 'active' : '' }` }></div>
                <div className={ `key ${ backward ? 'active' : '' }` }></div>
                <div className={ `key ${ rightward ? 'active' : '' }` }></div>
            </div>
            <div className="raw">
                <div className={ `key large ${ jump ? 'active' : '' }` }></div>
            </div>
        </div>
    </div>
}
