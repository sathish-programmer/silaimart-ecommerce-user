import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const FilterDrawer = ({ 
  isOpen, 
  onClose, 
  filters, 
  categories, 
  filterOptions, 
  masterValues, 
  handleFilterChange, 
  clearFilters, 
  activeFiltersCount 
}) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                    <div className="px-6 py-6 sm:px-8 border-b border-stone-100">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
                          <AdjustmentsHorizontalIcon className="h-6 w-6 text-primary-600" />
                          Refine Results
                        </Dialog.Title>
                        <button
                          type="button"
                          className="rounded-xl p-2 text-gray-400 hover:text-gray-500 hover:bg-stone-50 transition-all"
                          onClick={onClose}
                        >
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          {activeFiltersCount} Filters Applied
                        </p>
                        <button 
                          onClick={clearFilters}
                          className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                        >
                          Reset All
                        </button>
                      </div>
                    </div>

                    <div className="relative flex-1 px-6 py-8 sm:px-8 space-y-10">
                      {/* Categories Section */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</h3>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => handleFilterChange('category', '')}
                            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all text-left ${!filters.category ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-gray-600 border-stone-200'}`}
                          >
                            All Categories
                          </button>
                          {categories.map((cat) => (
                            <div key={cat._id} className="space-y-2">
                              <button
                                onClick={() => handleFilterChange('category', cat._id)}
                                className={`w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all text-left flex justify-between items-center ${filters.category === cat._id ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100' : 'bg-white text-gray-600 border-stone-200'}`}
                              >
                                {cat.name}
                                {filters.category === cat._id && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                              </button>
                              {filters.category === cat._id && cat.subCategories?.length > 0 && (
                                <div className="grid grid-cols-1 gap-2 pl-4">
                                  {cat.subCategories.map(sub => (
                                    <button
                                      key={sub._id}
                                      onClick={() => handleFilterChange('subCategory', sub._id)}
                                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all text-left ${filters.subCategory === sub._id ? 'bg-stone-100 text-gray-900 border-stone-300' : 'bg-white text-gray-400 border-stone-100'}`}
                                    >
                                      {sub.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price Range</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-[8px] font-black text-gray-400 uppercase ml-2">From</span>
                            <input
                              type="number"
                              placeholder="₹0"
                              value={filters.minPrice}
                              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold focus:border-primary-600 focus:ring-0 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[8px] font-black text-gray-400 uppercase ml-2">To</span>
                            <input
                              type="number"
                              placeholder="₹∞"
                              value={filters.maxPrice}
                              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold focus:border-primary-600 focus:ring-0 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Attributes Section */}
                      <div className="space-y-6">
                        {/* Material */}
                        {(filterOptions.materials?.length > 0 || masterValues.materials?.length > 0) && (
                          <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Material</h3>
                            <div className="flex flex-wrap gap-2">
                              {['', ...(masterValues.materials || filterOptions.materials || [])].map((m, idx) => {
                                const val = typeof m === 'object' ? m.value : m;
                                const label = typeof m === 'object' ? m.label : m || 'All';
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleFilterChange('material', val)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filters.material === val ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-gray-400 border-stone-200 hover:border-stone-400'}`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Rating */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rating</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {[4, 3, 2, 1].map((r) => (
                              <button
                                key={r}
                                onClick={() => handleFilterChange('rating', r.toString())}
                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${filters.rating === r.toString() ? 'bg-amber-400 text-gray-900 border-amber-400 shadow-lg shadow-amber-100' : 'bg-white text-gray-400 border-stone-200'}`}
                              >
                                {r}+ Stars
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-stone-100 px-6 py-6 sm:px-8 bg-stone-50">
                      <button
                        onClick={onClose}
                        className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-stone-200 active:scale-[0.98] transition-all"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default FilterDrawer;
