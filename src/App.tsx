/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  AlertTriangle, 
  Trash2, 
  Edit2, 
  MapPin, 
  Phone, 
  Gift, 
  Calendar, 
  X, 
  ExternalLink, 
  Check, 
  Building2, 
  Clock,
  Briefcase,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vendor, Category, ContractAlert } from './types';
import { INITIAL_VENDORS } from './data';

// Pin current simulated local date for reliable demo calculations
const CURRENT_DATE_STR = '2026-07-02';
const CURRENT_DATE = new Date(CURRENT_DATE_STR);

export default function App() {
  // --- States ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | '全部'>('全部');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'warning' | 'expired'>('all');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('食');
  const [formDiscount, setFormDiscount] = useState('');
  const [formContractEnd, setFormContractEnd] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Success notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // --- Load Initial Data ---
  useEffect(() => {
    const stored = localStorage.getItem('company_vendors_data');
    if (stored) {
      try {
        setVendors(JSON.parse(stored));
      } catch (e) {
        setVendors(INITIAL_VENDORS);
      }
    } else {
      setVendors(INITIAL_VENDORS);
      localStorage.setItem('company_vendors_data', JSON.stringify(INITIAL_VENDORS));
    }
  }, []);

  // --- Save to Local Storage helper ---
  const saveVendors = (newVendors: Vendor[]) => {
    setVendors(newVendors);
    localStorage.setItem('company_vendors_data', JSON.stringify(newVendors));
  };

  // --- Show Temporary Toast/Notification ---
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // --- Date Math Helpers ---
  const getDaysRemaining = (expiryDateStr: string): number => {
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - CURRENT_DATE.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getContractStatusInfo = (expiryDateStr: string) => {
    const days = getDaysRemaining(expiryDateStr);
    if (days < 0) {
      return {
        label: '已逾期',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        textClass: 'text-rose-600 font-semibold',
        dotClass: 'bg-rose-500',
        daysText: `逾期 ${Math.abs(days)} 天`,
        status: 'expired'
      };
    } else if (days <= 30) {
      return {
        label: '即將到期',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        textClass: 'text-amber-600 font-medium',
        dotClass: 'bg-amber-500',
        daysText: `剩餘 ${days} 天`,
        status: 'warning'
      };
    } else {
      return {
        label: '合作中',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        textClass: 'text-emerald-600',
        dotClass: 'bg-emerald-500',
        daysText: `剩餘 ${days} 天`,
        status: 'active'
      };
    }
  };

  // --- Alerts Calculations ---
  const alerts = useMemo(() => {
    const list: ContractAlert[] = [];
    vendors.forEach(v => {
      const days = getDaysRemaining(v.contractEnd);
      if (days < 0) {
        list.push({ vendorId: v.id, vendorName: v.name, daysRemaining: days, status: 'expired' });
      } else if (days <= 30) {
        list.push({ vendorId: v.id, vendorName: v.name, daysRemaining: days, status: 'warning' });
      }
    });
    // Sort so expired ones are at the top, then soonest-to-expire
    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [vendors]);

  // --- Filtering & Searching ---
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      // 1. Category search
      const matchesCategory = selectedCategory === '全部' || v.category === selectedCategory;
      
      // 2. Text Search (name, discount, address, phone)
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || 
        v.name.toLowerCase().includes(query) ||
        v.discount.toLowerCase().includes(query) ||
        v.address.toLowerCase().includes(query) ||
        v.phone.includes(query) ||
        v.category.includes(query);

      // 3. Status Search
      const days = getDaysRemaining(v.contractEnd);
      let matchesStatus = true;
      if (selectedStatus === 'expired') {
        matchesStatus = days < 0;
      } else if (selectedStatus === 'warning') {
        matchesStatus = days >= 0 && days <= 30;
      } else if (selectedStatus === 'active') {
        matchesStatus = days > 30;
      }

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [vendors, searchTerm, selectedCategory, selectedStatus]);

  // --- CRUD Actions ---
  const openAddForm = () => {
    setFormMode('add');
    setEditingVendor(null);
    setFormName('');
    setFormCategory('食');
    setFormDiscount('');
    setFormContractEnd('');
    setFormAddress('');
    setFormPhone('');
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (vendor: Vendor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Avoid selecting the vendor row when clicking Edit
    setFormMode('edit');
    setEditingVendor(vendor);
    setFormName(vendor.name);
    setFormCategory(vendor.category);
    setFormDiscount(vendor.discount);
    setFormContractEnd(vendor.contractEnd);
    setFormAddress(vendor.address);
    setFormPhone(vendor.phone);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = '請輸入店家名稱';
    if (!formDiscount.trim()) errors.discount = '請輸入優惠內容';
    if (!formContractEnd) errors.contractEnd = '請選擇合約期限';
    if (!formAddress.trim()) errors.address = '請輸入店家住址';
    if (!formPhone.trim()) errors.phone = '請輸入電話號碼';
    
    // Simple phone regex or length check
    if (formPhone.trim() && !/^[\d\s\-\(\)\+]{5,20}$/.test(formPhone)) {
      errors.phone = '電話格式不正確';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (formMode === 'add') {
      const newVendor: Vendor = {
        id: Date.now().toString(),
        name: formName.trim(),
        category: formCategory,
        discount: formDiscount.trim(),
        contractEnd: formContractEnd,
        address: formAddress.trim(),
        phone: formPhone.trim()
      };
      const updated = [newVendor, ...vendors];
      saveVendors(updated);
      showToast(`成功新增廠商：${newVendor.name}`);
    } else if (formMode === 'edit' && editingVendor) {
      const updated = vendors.map(v => 
        v.id === editingVendor.id 
          ? { 
              ...v, 
              name: formName.trim(), 
              category: formCategory, 
              discount: formDiscount.trim(), 
              contractEnd: formContractEnd, 
              address: formAddress.trim(), 
              phone: formPhone.trim() 
            } 
          : v
      );
      saveVendors(updated);
      
      // Update selected detail card if currently open
      if (selectedVendor && selectedVendor.id === editingVendor.id) {
        setSelectedVendor({
          id: editingVendor.id,
          name: formName.trim(),
          category: formCategory,
          discount: formDiscount.trim(),
          contractEnd: formContractEnd,
          address: formAddress.trim(),
          phone: formPhone.trim()
        });
      }
      
      showToast(`已更新廠商資訊：${formName.trim()}`);
    }

    setIsFormOpen(false);
  };

  const initiateDelete = (vendor: Vendor, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering list select modal
    setVendorToDelete(vendor);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (vendorToDelete) {
      const updated = vendors.filter(v => v.id !== vendorToDelete.id);
      saveVendors(updated);
      showToast(`已刪除合作廠商：${vendorToDelete.name}`, 'info');
      
      // If deleted vendor is selected, deselect
      if (selectedVendor && selectedVendor.id === vendorToDelete.id) {
        setSelectedVendor(null);
      }
      
      setVendorToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  // --- Category Badge Color Picker ---
  const getCategoryColor = (category: Category) => {
    switch (category) {
      case '食':
        return 'bg-rose-50 text-rose-700 border border-rose-200/60';
      case '衣':
        return 'bg-purple-50 text-purple-700 border border-purple-200/60';
      case '住':
        return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case '行':
        return 'bg-sky-50 text-sky-700 border border-sky-200/60';
      case '育':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      case '樂':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 antialiased font-sans pb-16 selection:bg-indigo-100 selection:text-indigo-950">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3.5 bg-slate-900 text-white rounded-xl shadow-xl text-sm font-medium border border-slate-800"
          >
            <div className={`w-2 h-2 rounded-full ${
              notification.type === 'success' ? 'bg-emerald-400' : notification.type === 'error' ? 'bg-rose-400' : 'bg-sky-400'
            }`} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xl">P</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">PartnerPro</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">特約廠商優惠與合約管理系統</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-200/50">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>系統基準日: {CURRENT_DATE_STR}</span>
          </div>
          <button 
            onClick={openAddForm}
            id="add-vendor-btn"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>新增廠商</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">

        {/* Contract Alert Box - Expiring Soon banner */}
        {alerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50/50 border border-amber-200/70 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 text-base">合約期限即將到期提醒</h3>
                <p className="text-sm text-amber-800 mt-0.5">
                  目前有 <strong className="font-bold text-rose-600">{alerts.filter(a => a.status === 'expired').length}</strong> 家合約已逾期，以及 <strong className="font-bold text-amber-600">{alerts.filter(a => a.status === 'warning').length}</strong> 家廠商在 30 天內即將到期。
                </p>
              </div>
            </div>
            
            {/* Quick Actions for Expiry Filtering */}
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => {
                  setSelectedStatus('expired');
                  setSelectedCategory('全部');
                  showToast('已篩選：已逾期合約', 'info');
                }}
                className="px-3.5 py-1.5 bg-rose-100/60 hover:bg-rose-100 text-rose-800 text-xs font-medium rounded-lg transition"
              >
                已逾期 ({alerts.filter(a => a.status === 'expired').length})
              </button>
              <button 
                onClick={() => {
                  setSelectedStatus('warning');
                  setSelectedCategory('全部');
                  showToast('已篩選：即將到期合約', 'info');
                }}
                className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-medium rounded-lg transition"
              >
                即將到期 ({alerts.filter(a => a.status === 'warning').length})
              </button>
              {selectedStatus !== 'all' && (
                <button 
                  onClick={() => {
                    setSelectedStatus('all');
                  }}
                  className="px-2.5 py-1.5 text-amber-700 hover:text-amber-900 text-xs font-semibold underline"
                >
                  清除狀態篩選
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Filter and Search Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 sm:p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜尋合作廠商名稱、優惠、電話、地址..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedStatus === 'all' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                全部合約
              </button>
              <button
                onClick={() => setSelectedStatus('active')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedStatus === 'active' 
                    ? 'bg-emerald-50 text-emerald-800 shadow-xs' 
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                合作中
              </button>
              <button
                onClick={() => setSelectedStatus('warning')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedStatus === 'warning' 
                    ? 'bg-amber-50 text-amber-800 shadow-xs' 
                    : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                即將到期
              </button>
              <button
                onClick={() => setSelectedStatus('expired')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedStatus === 'expired' 
                    ? 'bg-rose-50 text-rose-800 shadow-xs' 
                    : 'text-slate-500 hover:text-rose-700'
                }`}
              >
                已逾期
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters Row */}
        <nav className="bg-white border border-slate-200 rounded-2xl px-6 py-3 flex gap-2 overflow-x-auto shrink-0 mb-6 shadow-xs scrollbar-none">
          {(['全部', '食', '衣', '住', '行', '育', '樂', '其他'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Geometric Balance Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Vendor List Column */}
          <section className="lg:col-span-5 border border-slate-200 rounded-2xl bg-white flex flex-col overflow-hidden shadow-xs h-[580px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>廠商清單 ({filteredVendors.length})</span>
              <span>合約狀態</span>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => {
                  const statusInfo = getContractStatusInfo(vendor.contractEnd);
                  const isSelected = selectedVendor?.id === vendor.id;
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => setSelectedVendor(vendor)}
                      className={`p-5 transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <h3 className={`font-bold text-slate-900 transition-colors ${isSelected ? 'text-indigo-700' : ''}`}>
                          {vendor.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                          vendor.category === '食' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          vendor.category === '衣' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          vendor.category === '住' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          vendor.category === '行' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                          vendor.category === '育' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          vendor.category === '樂' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {vendor.category}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-mono">
                          合約期限: {vendor.contractEnd}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase ${statusInfo.textClass}`}>
                            {statusInfo.daysText}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${
                            statusInfo.status === 'expired' ? 'bg-rose-500 animate-pulse' : 
                            statusInfo.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm">無符合條件的特約廠商</h3>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('全部');
                      setSelectedStatus('all');
                    }}
                    className="mt-2 text-xs font-semibold text-indigo-600 underline"
                  >
                    重設篩選
                  </button>
                </div>
              )}
            </div>

            {/* List Footer */}
            <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>基準日: {CURRENT_DATE_STR}</span>
              <span>顯示 {filteredVendors.length} / 共 {vendors.length}</span>
            </div>
          </section>

          {/* Right Column: Detail Pane (Desktop only, mobile will open modal popup) */}
          <section className="hidden lg:flex lg:col-span-7 bg-slate-50 flex-col h-[580px]">
            <AnimatePresence mode="wait">
              {selectedVendor ? (
                <motion.div
                  key={selectedVendor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl shadow-xs border border-slate-200 flex-1 flex flex-col overflow-hidden h-full"
                >
                  {/* Detail Header & Info Grid */}
                  <div className="p-8 border-b border-slate-100 flex-1 overflow-y-auto space-y-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 ${
                          selectedVendor.category === '食' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          selectedVendor.category === '衣' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          selectedVendor.category === '住' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          selectedVendor.category === '行' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                          selectedVendor.category === '育' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          selectedVendor.category === '樂' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {selectedVendor.category} 類別特約商
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          {selectedVendor.name}
                        </h2>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => openEditForm(selectedVendor, e)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200"
                          title="編輯資料"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => initiateDelete(selectedVendor, e)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                          title="刪除廠商"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Two-column Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
                      
                      {/* Left: Discount content */}
                      <div className="md:col-span-7 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">特約優惠內容</label>
                        <div className="bg-indigo-50/20 border border-indigo-100 rounded-xl p-5 text-slate-700 leading-relaxed font-medium text-sm shadow-inner">
                          {selectedVendor.discount}
                        </div>
                      </div>
                      
                      {/* Right: Address & Phone */}
                      <div className="md:col-span-5 space-y-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">住址</label>
                          <p className="text-slate-700 text-sm leading-relaxed">{selectedVendor.address}</p>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVendor.name + ' ' + selectedVendor.address)}`}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-1"
                          >
                            <span>在 Google 地圖上查看</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">聯絡電話</label>
                          <p className="text-indigo-600 font-bold text-lg font-mono">
                            {selectedVendor.phone}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Expiry Alert Bar at bottom of details */}
                  <div className={`mt-auto p-5 flex items-center justify-between border-t ${
                    getContractStatusInfo(selectedVendor.contractEnd).status === 'expired' 
                      ? 'bg-rose-50 border-rose-100 text-rose-800' 
                      : getContractStatusInfo(selectedVendor.contractEnd).status === 'warning'
                        ? 'bg-amber-50 border-amber-100 text-amber-800'
                        : 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span className="text-xs font-semibold">
                        合約期限提醒：此合約於 {selectedVendor.contractEnd} 到期 ({getContractStatusInfo(selectedVendor.contractEnd).daysText})。
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Selected vendor empty state
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100 shadow-xs">
                    <Building2 className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">未選取任何廠商</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
                    請點選左側清單中的特約廠商。
                    選取後，此處將立即呈現該廠商的特約優惠詳情、住址與聯絡電話。
                  </p>
                </div>
              )}
            </AnimatePresence>
          </section>

        </div>

      </main>

      {/* =========================================
          POPUPS / DIALOGS WITH ANIMATION 
          ========================================= */}

      <AnimatePresence>
        
        {/* =========================================
            1. VENDOR DETAIL DIALOG (當選擇店家名稱後跳出 - 行動版顯示)
            ========================================= */}
        {selectedVendor && (
          <>
            {/* Backdrop (hidden on large desktop layouts since details are shown inline) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVendor(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 lg:hidden"
            >
              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 z-50"
              >
                
                {/* Modal Header Cover Accent */}
                <div className="bg-gradient-to-r from-indigo-50 to-sky-50 px-6 py-5 relative border-b border-slate-100 flex items-start justify-between">
                  <div className="flex-1 pr-6">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedVendor.category === '食' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      selectedVendor.category === '衣' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      selectedVendor.category === '住' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      selectedVendor.category === '行' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                      selectedVendor.category === '育' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      selectedVendor.category === '樂' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      特約 {selectedVendor.category} 類別
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-2.5 leading-snug">
                      {selectedVendor.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5">
                  
                  {/* Contract Expiration Info */}
                  <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">合約有效期限</div>
                      <div className="font-mono text-sm font-semibold text-slate-800 mt-0.5">
                        {selectedVendor.contractEnd}
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase font-mono ${getContractStatusInfo(selectedVendor.contractEnd).badgeClass}`}>
                        {getContractStatusInfo(selectedVendor.contractEnd).label}
                      </span>
                    </div>
                  </div>

                  {/* Discount Section (優惠內容) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">特約優惠內容</label>
                    <div className="bg-indigo-50/20 border border-indigo-100 rounded-xl p-5 text-slate-800 text-sm font-semibold leading-relaxed">
                      {selectedVendor.discount}
                    </div>
                  </div>

                  {/* Phone & Address Grid */}
                  <div className="grid grid-cols-1 gap-4 pt-1">
                    
                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">連絡電話</div>
                        <a 
                          href={`tel:${selectedVendor.phone}`}
                          className="text-sm font-semibold text-indigo-600 hover:underline mt-0.5 inline-block font-mono"
                        >
                          {selectedVendor.phone}
                        </a>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">廠商住址</div>
                        <div className="text-sm font-semibold text-slate-800 mt-0.5 leading-relaxed">
                          {selectedVendor.address}
                        </div>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVendor.name + ' ' + selectedVendor.address)}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-bold shrink-0 self-center border border-indigo-100 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition"
                      >
                        <span>地圖</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                  </div>

                </div>

                {/* Modal Footer Controls */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      setSelectedVendor(null);
                      initiateDelete(selectedVendor, e);
                    }}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-2 rounded-lg hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>刪除廠商</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        openEditForm(selectedVendor, e);
                      }}
                      className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>編輯資訊</span>
                    </button>
                    <button
                      onClick={() => setSelectedVendor(null)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow transition"
                    >
                      確認關閉
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          </>
        )}

        {/* =========================================
            2. ADD / EDIT VENDOR FORM MODAL (後台更新資訊)
            ========================================= */}
        {isFormOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 z-50 my-8"
              >
                
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {formMode === 'add' ? '✨ 新增合作特約廠商' : '📝 編輯特約廠商資訊'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">請填寫或更新特約廠商基本資料及合約有效期限</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleFormSubmit}>
                  <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin">
                    
                    {/* Store Name input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        店家名稱 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="例如：好時光精品咖啡館 (Good Times Coffee)"
                        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition ${
                          formErrors.name ? 'border-rose-300 ring-2 ring-rose-50' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                          <span>⚠️ {formErrors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Category Selector & Contract end date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          類別分類 <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as Category)}
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition cursor-pointer"
                        >
                          <option value="食">食 (餐飲)</option>
                          <option value="衣">衣 (服裝)</option>
                          <option value="住">住 (住宿)</option>
                          <option value="行">行 (交通)</option>
                          <option value="育">育 (教育)</option>
                          <option value="樂">樂 (娛樂)</option>
                          <option value="其他">其他 (其他)</option>
                        </select>
                      </div>

                      {/* Expiry Date */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          合約期限 <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formContractEnd}
                          onChange={(e) => setFormContractEnd(e.target.value)}
                          className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-mono transition cursor-pointer ${
                            formErrors.contractEnd ? 'border-rose-300 ring-2 ring-rose-50' : 'border-slate-200'
                          }`}
                        />
                        {formErrors.contractEnd && (
                          <p className="text-xs text-rose-500 mt-1.5">
                            ⚠️ {formErrors.contractEnd}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        電話號碼 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="例如：02-2362-0000"
                        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-mono transition ${
                          formErrors.phone ? 'border-rose-300 ring-2 ring-rose-50' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-xs text-rose-500 mt-1.5">
                          ⚠️ {formErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        店家住址 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="例如：台北市大安區新生南路三段 88 號 1 樓"
                        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition ${
                          formErrors.address ? 'border-rose-300 ring-2 ring-rose-50' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.address && (
                        <p className="text-xs text-rose-500 mt-1.5">
                          ⚠️ {formErrors.address}
                        </p>
                      )}
                    </div>

                    {/* Discount content */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        特約優惠內容 <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formDiscount}
                        onChange={(e) => setFormDiscount(e.target.value)}
                        placeholder="請詳細填寫員工識別證可享有的優惠，例如：憑證享全品項 9 折..."
                        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition resize-none ${
                          formErrors.discount ? 'border-rose-300 ring-2 ring-rose-50' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.discount && (
                        <p className="text-xs text-rose-500 mt-1.5">
                          ⚠️ {formErrors.discount}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Form Footer Buttons */}
                  <div className="bg-slate-50 px-6 py-4.5 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition active:scale-95"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition active:scale-95"
                    >
                      {formMode === 'add' ? '建立合作特約' : '儲存更新'}
                    </button>
                  </div>
                </form>

              </motion.div>
            </motion.div>
          </>
        )}

        {/* =========================================
            3. DOUBLE-CONFIRM DELETE MODAL
            ========================================= */}
        {isDeleteConfirmOpen && vendorToDelete && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            >
              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 z-50"
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">確認要刪除此合作廠商嗎？</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    您即將刪除特約廠商 <strong>{vendorToDelete.name}</strong> 的全部特約資訊。
                    此操作將立即生效且無法復原。
                  </p>
                </div>
                
                {/* Actions Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="px-4.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
                  >
                    保留合約
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow transition"
                  >
                    確認刪除
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

      </AnimatePresence>

    </div>
  );
}
