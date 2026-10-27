import React from 'react';
import { useLocalization } from '../../i18n/Localization';
export function Panel({ title, detail, children }: any) {
  const { t } = useLocalization();
  return (
    <section className="campus-panel">
      <h3>{t(title)}</h3>
      {detail && <p className="campus-muted">{t(detail)}</p>}
      {children}
    </section>
  );
}
export function Empty({ children = 'No records yet.' }: any) {
  return <p className="campus-empty">{children}</p>;
}
export function RecordList({ items, render }: any) {
  return items?.length ? (
    <div className="campus-records">
      {items.map((item: any) => (
        <div className="campus-record" key={item.id || item.user_id}>
          {render ? (
            render(item)
          ) : (
            <>
              <strong>{item.title || item.action}</strong>
              <p>
                {item.description ||
                  item.status ||
                  item.created_at ||
                  item.createdAt}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  ) : (
    <Empty />
  );
}
