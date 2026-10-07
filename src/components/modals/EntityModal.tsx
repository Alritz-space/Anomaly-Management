import React from 'react';
import { MockEntity } from '../../data/mockData';
import {
  X,
  Building,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { useAnomaly } from '../../context/AnomalyContext';

interface Props {
  entity: MockEntity;
  onClose: () => void;
}

export const EntityModal: React.FC<Props> = ({ entity, onClose }) => {
  const { setActivePage, setDashboardTab } = useAnomaly();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">{entity.name}</h3>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {entity.type} Master Record
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Entity ID: {entity.id} · Tax ID: {entity.taxId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Active Anomalies Alert */}
          {entity.activeAnomaliesCount > 0 && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span className="text-amber-900 font-medium">
                  This entity has <span className="font-bold">{entity.activeAnomaliesCount}</span> active anomaly alerts pending period close review.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActivePage('dashboard');
                  setDashboardTab('transactions');
                }}
                className="px-2.5 py-1 bg-amber-700 text-white rounded-md text-[11px] font-semibold hover:bg-amber-800 transition-colors"
              >
                View in Dashboard
              </button>
            </div>
          )}

          {/* Key Financial Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Terms</span>
              <span className="font-bold text-slate-800 text-sm">{entity.paymentTerms}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Base Currency</span>
              <span className="font-bold text-slate-800 text-sm">{entity.currency}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Open Balance</span>
              <span className="font-bold text-slate-900 text-sm">
                ${entity.openBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Credit Limit</span>
              <span className="font-bold text-slate-800 text-sm">
                ${entity.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Primary Contact & Communications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Billing Email</span>
                  <span className="font-medium">{entity.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Direct Phone</span>
                  <span className="font-medium">{entity.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-slate-700">
              <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Remittance / Billing Address</span>
                <span className="font-medium text-slate-800">{entity.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
