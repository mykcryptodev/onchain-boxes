/* eslint-disable @typescript-eslint/ban-ts-comment */
// Ignore is required because of the way the Countdown component is written with --value css props
import { type FC } from "react";
import Countdown from "react-countdown";

interface CountdownTimerProps {
  timestamp: number; // unix timestamp
  className?: string;
  renderBoxes?: boolean;
  completeText?: string;
  onComplete?: () => void;
}

export const CountdownTimer: FC<CountdownTimerProps> = ({ timestamp, className, renderBoxes, onComplete, completeText }) => {
  // Renderer callback with condition
  const renderer = ({ days, hours, minutes, seconds, completed } : {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed) {
      // Render a completed state
      return <span>{completeText || "Complete"}</span>;
    } else {
      hours = hours % 24;
      minutes = minutes % 60;
      seconds = seconds % 60;
      const months = Math.floor(days / 30);
      days = days % 30;
      let time = "";
      if (months > 0) {
        time += `${months}m `;
      }
      if (days > 0) {
        time += `${days}d `;
      }
      if (hours > 0 && months < 1) {
        time += `${hours}h `;
      }
      if (minutes > 0 && months < 1) {
        time += `${minutes}m `;
      }
      if (seconds > 0 && days < 1) {
        time += `${seconds}s `;
      }
      // Render a countdown
      return <span>{time}</span>;
    }
  };

  const boxRenderer = ({ days, hours, minutes, seconds, completed } : {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed) {
      onComplete?.();
      // Render a completed state
      return <span>{completeText || "Complete"}</span>;
    } else {
      hours = hours % 24;
      minutes = minutes % 60;
      seconds = seconds % 60;
      const months = Math.floor(days / 30);
      days = days % 30;
      const times = [
        { name: "month", value: months },
        { name: "day", value: days },
        { name: "hour", value: hours },
        { name: "minute", value: minutes, hide: months > 0 },
        { name: "second", value: seconds, hide: days > 0 },
      ]
      // Render a countdown
      return (
        <div className="grid grid-flow-col gap-5 text-center place-content-center">
          {times.map((time, i) => {
            if ((time.value > 0 || time.name === "second") && !time.hide) {
              return (
                <div key={i} className="flex flex-col p-2 rounded-box">
                  <span className="countdown text-lg">
                    {/* @ts-ignore */}
                    <span className="text-center w-full" style={{"--value":time.value}}></span>
                  </span>
                  <span>{time.name}{time.value > 1 ? 's' : ''}</span>
                </div>
              )
            }
          })}
        </div>    
      )
    }
  }
  return (
    <Countdown
      date={timestamp} 
      renderer={renderBoxes ? boxRenderer : renderer} 
      className={className} 
    />
  )
}

export default CountdownTimer;