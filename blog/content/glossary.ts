// Glossary entries. Keep definitions short, factual and jurisdiction-neutral unless noted.
export interface GlossaryEntry {
  id: string;
  ko: { term: string; def: string };
  en: { term: string; def: string };
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "si",
    ko: { term: "SI (전략적 투자자)", def: "사업 시너지나 전략적 목적을 위해 투자하는 투자자. 주로 사업회사이며, 재무적 수익보다 사업 협력, 기술·시장 확보, 경영권 확보 등을 중시한다." },
    en: { term: "SI (strategic investor)", def: "An investor, usually an operating company, that invests for strategic reasons such as business synergies, access to technology or markets, or control, rather than purely for financial return." },
  },
  {
    id: "fi",
    ko: { term: "FI (재무적 투자자)", def: "재무적 수익을 목적으로 투자하는 투자자. 사모펀드(PEF), 벤처캐피탈, 연기금, 증권사 등이 해당하며, 보통 일정 기간 후 회수(엑시트)를 전제로 투자한다." },
    en: { term: "FI (financial investor)", def: "An investor seeking financial return, such as a private equity fund, venture capital firm, pension fund or securities firm. FIs usually invest with an exit in mind after a set period." },
  },
  {
    id: "cvc",
    ko: { term: "CVC (기업형 벤처캐피탈)", def: "사업회사가 설립하거나 운영하는 벤처캐피탈. 본업과 관련된 스타트업에 투자해 전략적 기회를 찾는다. 국내에서는 2021년 말부터 일반지주회사도 요건을 갖추면 CVC를 보유할 수 있게 됐다." },
    en: { term: "CVC (corporate venture capital)", def: "A venture capital arm set up or run by an operating company to invest in startups relevant to its business. In Korea, general holding companies have been allowed to own a CVC, under conditions, since the end of 2021." },
  },
  {
    id: "rcps",
    ko: { term: "RCPS (상환전환우선주)", def: "투자자가 일정 조건에서 회사에 투자금 상환을 청구할 수 있고(상환권), 보통주로 전환할 수도 있는(전환권) 우선주. 국내 벤처·성장 투자에서 가장 흔한 형태이며, 상환권이 투자자에게 있으면 회계상 부채로 분류되는 경우가 많다." },
    en: { term: "RCPS (redeemable convertible preferred shares)", def: "Preferred shares the holder can ask the company to redeem under set conditions and can also convert into common shares. The most common instrument in Korean venture and growth deals; when the holder controls redemption, they are often classified as a liability under IFRS." },
  },
  {
    id: "cb",
    ko: { term: "CB (전환사채)", def: "일정 기간이 지나면 미리 정한 전환가액으로 발행회사의 주식으로 전환할 수 있는 사채. 전환하면 사채는 소멸하고 주식이 늘어나므로 기존 주주 지분이 희석될 수 있다." },
    en: { term: "CB (convertible bond)", def: "A bond that can be converted into the issuer's shares at a preset conversion price after a set date. On conversion the debt goes away and new shares are issued, which can dilute existing shareholders." },
  },
  {
    id: "bw",
    ko: { term: "BW (신주인수권부사채)", def: "사채에 발행회사의 신주를 정해진 가격에 인수할 수 있는 권리(워런트)가 붙은 것. 워런트를 행사해 신주를 받아도 사채 자체는 만기까지 남는다는 점이 전환사채와 다르다." },
    en: { term: "BW (bond with warrants)", def: "A bond that comes with warrants to subscribe for new shares of the issuer at a set price. Unlike a convertible bond, the bond itself stays outstanding to maturity after the warrants are exercised." },
  },
  {
    id: "eb",
    ko: { term: "EB (교환사채)", def: "발행회사가 보유한 다른 회사 주식이나 자기주식으로 교환할 수 있는 사채. 신주가 발행되지 않는다는 점에서 전환사채와 다르다." },
    en: { term: "EB (exchangeable bond)", def: "A bond exchangeable into shares the issuer already holds, such as another company's stock or treasury shares. No new shares are issued, unlike a convertible bond." },
  },
  {
    id: "tag-along",
    ko: { term: "태그얼롱 (동반매도권)", def: "대주주가 지분을 제3자에게 팔 때 소수주주도 같은 조건으로 함께 팔 수 있는 권리. 소수주주를 보호하는 조항이다." },
    en: { term: "Tag-along right", def: "A minority shareholder's right to sell alongside, on the same terms, when a major shareholder sells to a third party. It protects minority holders." },
  },
  {
    id: "drag-along",
    ko: { term: "드래그얼롱 (동반매도청구권)", def: "일정 요건을 갖춘 주주가 지분을 매각할 때 다른 주주에게도 같은 조건으로 함께 팔도록 요구할 수 있는 권리. 매수인이 100% 지분을 원할 때 매각을 성사시키는 장치다." },
    en: { term: "Drag-along right", def: "A right of a qualifying shareholder, when selling, to require the other shareholders to sell on the same terms. It lets a sale go through when the buyer wants 100%." },
  },
  {
    id: "rofr",
    ko: { term: "우선매수권 (ROFR)", def: "주주가 제3자에게 지분을 팔려고 할 때, 다른 주주가 같은 조건으로 먼저 살 수 있는 권리. 매도 전에 먼저 제안받을 권리인 우선협상권(ROFO)과 구별된다." },
    en: { term: "Right of first refusal (ROFR)", def: "The right to buy a shareholder's stake on the same terms before it can be sold to a third party. Distinct from a right of first offer (ROFO), which only requires the seller to offer the stake first." },
  },
  {
    id: "put-option",
    ko: { term: "풋옵션 (주식매수청구권 약정)", def: "투자자가 상대방(대주주나 회사 등)에게 정해진 가격이나 산식으로 자신의 지분을 사 가도록 요구할 수 있는 권리. 국내 투자에서는 IPO 무산 등 조건과 일정 수익률 보장과 함께 쓰이는 경우가 많다." },
    en: { term: "Put option", def: "An investor's right to require a counterparty, such as the controlling shareholder or the company, to buy its stake at a set price or formula. In Korean deals it is often tied to triggers like a failed IPO and a guaranteed return." },
  },
  {
    id: "call-option",
    ko: { term: "콜옵션 (매도청구권 약정)", def: "정해진 가격이나 산식으로 상대방의 지분을 사 올 수 있는 권리. 대주주가 투자자 지분을 일정 수익률로 되사 오는 구조에 자주 쓰인다." },
    en: { term: "Call option", def: "The right to buy a counterparty's stake at a set price or formula. Often used so a controlling shareholder can buy back an investor's stake at a set return." },
  },
  {
    id: "control-premium",
    ko: { term: "경영권 프리미엄", def: "회사의 지배권(경영권)을 넘겨받는 대가로 시장가격이나 지분가치에 더해 지급하는 웃돈. 소수지분 거래에는 보통 붙지 않는다." },
    en: { term: "Control premium", def: "The amount paid above market price or pro-rata value for control of a company. Minority stake deals usually carry no such premium." },
  },
  {
    id: "event-study",
    ko: { term: "이벤트 스터디", def: "공시나 발표 같은 사건 전후의 주가 수익률을 시장(또는 기대) 수익률과 비교해 그 사건이 주가에 준 영향을 측정하는 방법." },
    en: { term: "Event study", def: "A method that measures how an event, such as an announcement, affected a stock by comparing its returns around the event with market or expected returns." },
  },
  {
    id: "car",
    ko: { term: "CAR (누적초과수익률)", def: "일정 구간 동안 종목 수익률에서 기대 수익률(예: 시장지수 수익률)을 뺀 초과수익률을 합산한 값. 이벤트 스터디의 핵심 지표다." },
    en: { term: "CAR (cumulative abnormal return)", def: "The sum of a stock's abnormal returns, its return minus an expected return such as the market index, over a window. The core measure in an event study." },
  },
];
