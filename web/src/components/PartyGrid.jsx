import PartyCard, { EmptySlot } from './PartyCard';

function formatMoney(n) {
  return n != null ? `$${Number(n).toLocaleString()}` : null;
}

export default function PartyGrid({ trainerName, party, routeMap, trainerSprite, money, coins }) {
  const slots = [];
  for (let i = 0; i < 6; i++) {
    slots.push(party[i] || null);
  }

  return (
    <div className="pg">
      <div className="pg-banner glass-card">
        {trainerSprite && (
          <img className="pg-banner-sprite" src={trainerSprite} alt="" />
        )}
        <div className="pg-banner-info">
          <span className="pg-trainer-name">{trainerName}</span>
          {money != null && <span className="pg-money">{formatMoney(money)}</span>}
          {coins != null && coins > 0 && <span className="pg-coins">{Number(coins).toLocaleString()} coins</span>}
        </div>
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
