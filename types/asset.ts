export interface Asset {
  id: string;
  asset: string;
  dateInPlace: string; // ISO string
  account: string;
  department: string;
  cost: number;
  lifeMonths: number;
  monthlyDep: number;
  accumDep: number;
  nbv: number;
  depSchedule: Record<string, number>; // MM/DD/YYYY -> depreciation amount
}

export interface AssetData {
  assets: Asset[];
}
