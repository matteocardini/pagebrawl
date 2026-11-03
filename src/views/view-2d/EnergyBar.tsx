import type { FighterId } from '../../engine/types';

type Props = {
  side: FighterId;
  name: string;
  energy: number;
};

export function EnergyBar({ side, name, energy }: Props) {
  return (
    <div className={`energy energy--${side.toLowerCase()}`}>
      <span className="energy__name" title={name}>
        {name}
      </span>
      <div
        className="energy__track"
        role="progressbar"
        aria-label={`${name} energy`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={energy}
      >
        <div className="energy__fill" style={{ width: `${energy}%` }} />
      </div>
    </div>
  );
}
