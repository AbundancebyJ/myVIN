// Links to primary sources. Posts cite filings by id; these build the URLs.

/** DART (Korea) filing viewer, by receipt number (rcpNo, 14 digits). */
export function dartUrl(rcpNo: string): string {
  if (!/^\d{14}$/.test(rcpNo)) throw new Error(`Invalid DART rcpNo: ${rcpNo}`);
  return `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcpNo}`;
}

/** SEC EDGAR filing index, by CIK and accession number (0001234567-24-000123). */
export function secUrl(cik: string, accession: string): string {
  const c = cik.replace(/^0+/, "");
  if (!/^\d+$/.test(c) || !/^\d{10}-\d{2}-\d{6}$/.test(accession)) {
    throw new Error(`Invalid SEC reference: ${cik} ${accession}`);
  }
  return `https://www.sec.gov/Archives/edgar/data/${c}/${accession.replace(/-/g, "")}/${accession}-index.htm`;
}
