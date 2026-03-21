import CompactPartyCard, { CompactEmptySlot } from './CompactPartyCard';

function formatMoney(n) {
  return n != null ? `$${Number(n).toLocaleString()}` : null;
}

export default function CompactPartyGrid({ trainerName, party, trainerSprite, money, coins }) {
  const slots = [];
  for (let i = 0; i < 6; i++) {
    slots.push(party[i] || null);
  }

  return (
    <div className="cpg glass-card">
      <div className="cpg-banner">
        {trainerSprite && (
          <img className="cpg-banner-sprite" src={trainerSprite} alt="" />
        )}
        <div className="cpg-banner-info">
          <span className="cpg-trainer-name">{trainerName}</span>
          {money != null && <span className="cpg-money">{formatMoney(money)}</span>}
          {coins != null && coins > 0 && <span className="cpg-coins">{Number(coins).toLocaleString()} coins</span>}
        </div>
      </div>
      <div className="cpg-grid">
        {slots.map((mon, i) =>
          mon ? (
            <CompactPartyCard key={mon.personality || i} mon={mon} />
          ) : (
            <CompactEmptySlot key={`empty-${i}`} />
          )
        )}
      </div>
    </div>
  );
}
