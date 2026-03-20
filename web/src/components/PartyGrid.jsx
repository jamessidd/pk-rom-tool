import PartyCard, { EmptySlot } from './PartyCard';

export default function PartyGrid({ trainerName, party, routeMap, trainerSprite }) {
  const slots = [];
  for (let i = 0; i < 6; i++) {
    slots.push(party[i] || null);
  }

  return (
    <div className="pg">
      <div className="pg-header">
        {trainerSprite && (
          <img className="pg-trainer-sprite" src={trainerSprite} alt="" />
        )}
        <span className="pg-trainer-name">{trainerName}</span>
      </div>
      <div className="pg-grid">
        {slots.map((mon, i) =>
          mon ? (
            <PartyCard
              key={mon.personality || i}
              mon={mon}
              routeName={routeMap?.[mon.personality]}
            />
          ) : (
            <EmptySlot key={`empty-${i}`} />
          )
        )}
      </div>
    </div>
  );
}
