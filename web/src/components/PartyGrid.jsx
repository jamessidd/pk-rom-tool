import { useRef, useLayoutEffect, useCallback } from 'react';
import PartyCard, { EmptySlot } from './PartyCard';

export default function PartyGrid({ trainerName, party, routeMap, trainerSprite, inBattle, opponentTypes }) {
  const slots = [];
  for (let i = 0; i < 6; i++) {
    slots.push(party[i] || null);
  }

  const nodeMapRef = useRef(new Map());
  const prevRectsRef = useRef(new Map());
  const prevOrderRef = useRef('');

  const registerNode = useCallback((personality, node) => {
    if (node) {
      nodeMapRef.current.set(personality, node);
    } else {
      nodeMapRef.current.delete(personality);
    }
  }, []);

  const currentOrder = slots.map(m => m?.personality ?? 'empty').join(',');

  useLayoutEffect(() => {
    const prevRects = prevRectsRef.current;
    const nodeMap = nodeMapRef.current;
    const orderChanged = prevOrderRef.current !== '' && prevOrderRef.current !== currentOrder;

    if (orderChanged) {
      nodeMap.forEach((node, personality) => {
        const prev = prevRects.get(personality);
        if (!prev) return;

        const curr = node.getBoundingClientRect();
        const dx = prev.left - curr.left;
        const dy = prev.top - curr.top;

        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

        node.classList.remove('pc-flip-animate');
        node.style.transform = `translate(${dx}px, ${dy}px)`;

        requestAnimationFrame(() => {
          node.classList.add('pc-flip-animate');
          node.style.transform = '';

          const onEnd = () => {
            node.classList.remove('pc-flip-animate');
            node.removeEventListener('transitionend', onEnd);
          };
          node.addEventListener('transitionend', onEnd);
        });
      });
    }

    prevOrderRef.current = currentOrder;

    const nextRects = new Map();
    nodeMap.forEach((node, personality) => {
      nextRects.set(personality, node.getBoundingClientRect());
    });
    prevRectsRef.current = nextRects;
  });

  return (
    <div className="pg pg-group">
      <span className="pg-inline-name">{trainerName}</span>
      <div className={`pg-grid ${inBattle ? 'pg-grid-battle' : ''}`}>
      {slots.map((mon, i) =>
        mon ? (
          <div
            key={mon.personality || i}
            ref={node => registerNode(mon.personality, node)}
          >
            <PartyCard
              mon={mon}
              routeName={routeMap?.[mon.personality]}
              isActiveBattler={inBattle && i === 0}
              inBattle={inBattle}
              opponentTypes={opponentTypes}
            />
          </div>
        ) : (
          <EmptySlot key={`empty-${i}`} />
        )
      )}
      </div>
    </div>
  );
}
