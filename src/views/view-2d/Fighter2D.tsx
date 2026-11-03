import type { FighterId, Round } from '../../engine/types';
import { HitDetail } from '../HitDetail';

type Props = {
  side: FighterId;
  hit: Round | null;
  attacking: boolean;
  knockedOut: boolean;
};

/** A pixel-style "browser window" fighter drawn with CSS blocks. */
export function Fighter2D({ side, hit, attacking, knockedOut }: Props) {
  const classes = ['fighter', `fighter--${side.toLowerCase()}`];
  if (attacking) classes.push('fighter--attacking');
  if (knockedOut) classes.push('fighter--ko');

  return (
    <div className={classes.join(' ')} aria-hidden="true">
      {/* the key restarts the one-shot hit animation on every new round */}
      <div key={hit ? hit.index : 'idle'} className={hit ? 'fighter__body fighter__body--hit' : 'fighter__body'}>
        <div className="fighter__bar">
          <i />
          <i />
          <i />
        </div>
        <div className="fighter__face">
          <b />
          <b />
        </div>
        <div className="fighter__lines">
          <i />
          <i />
        </div>
      </div>
      {hit && (
        <div key={`dmg-${hit.index}`} className={hit.crit ? 'damage damage--crit' : 'damage'}>
          -{hit.damage}
          {hit.crit && <small>CRIT!</small>}
          <HitDetail round={hit} />
        </div>
      )}
    </div>
  );
}
