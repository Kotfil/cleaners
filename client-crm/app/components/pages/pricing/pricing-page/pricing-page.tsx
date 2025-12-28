'use client';

import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Edit3, MoreVertical, Eye, Copy, Trash2, Star, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  PriceBook, 
  Service, 
  ViewMode, 
  HoursMatrix 
} from './pricing-page.types';
import { 
  SERVICES_DATA, 
  HOME_SIZE_OPTIONS, 
  getDefaultHoursMatrix, 
  getDefaultCrewSizeMatrix 
} from './pricing-page.constants';

export const PricingPage: React.FC = () => {
  const [priceBooks, setPriceBooks] = useState<PriceBook[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<PriceBook | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('services');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingHourCell, setEditingHourCell] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('crm_price_books');
    if (saved) {
      setPriceBooks(JSON.parse(saved));
    } else {
      const defaultBook: PriceBook = {
        id: `PB-${Date.now()}`,
        name: 'Price Book — October 2025',
        status: 'Published',
        isCurrent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        services: Object.values(SERVICES_DATA).flat(),
        hoursMatrix: getDefaultHoursMatrix(),
        crewSizeMatrix: getDefaultCrewSizeMatrix(),
      };
      setPriceBooks([defaultBook]);
      localStorage.setItem('crm_price_books', JSON.stringify([defaultBook]));
    }
  }, []);

  const saveBooks = (books: PriceBook[]) => {
    setPriceBooks(books);
    localStorage.setItem('crm_price_books', JSON.stringify(books));
  };

  const publishBook = (id: string) => {
    const updated = priceBooks.map(book => 
      book.id === id ? { ...book, status: 'Published' as const, updatedAt: new Date().toISOString() } : book
    );
    saveBooks(updated);
    setOpenDropdown(null);
  };

  const markAsCurrent = (id: string) => {
    const updated = priceBooks.map(book => ({
      ...book,
      isCurrent: book.id === id,
      updatedAt: book.id === id ? new Date().toISOString() : book.updatedAt,
    }));
    saveBooks(updated);
    setOpenDropdown(null);
  };

  const deleteBook = (id: string) => {
    if (confirm('Are you sure you want to delete this price book?')) {
      saveBooks(priceBooks.filter(book => book.id !== id));
      setOpenDropdown(null);
    }
  };

  const duplicateBook = (sourceBook: PriceBook) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const newBook: PriceBook = {
      ...sourceBook,
      id: `PB-${Date.now()}`,
      name: `${sourceBook.name} ${timeStr}`,
      status: 'Draft',
      isCurrent: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    saveBooks([...priceBooks, newBook]);
    setOpenDropdown(null);
  };

  const handleCreateBook = () => {
    if (!newBookName.trim()) return;
    const now = new Date();
    const newBook: PriceBook = {
      id: `PB-${Date.now()}`,
      name: newBookName.trim(),
      status: 'Draft',
      isCurrent: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      services: Object.values(SERVICES_DATA).flat(),
      hoursMatrix: getDefaultHoursMatrix(),
      crewSizeMatrix: getDefaultCrewSizeMatrix(),
    };
    saveBooks([...priceBooks, newBook]);
    setShowCreateModal(false);
    setNewBookName('');
  };

  const openCreateModal = () => {
    const now = new Date();
    const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    setNewBookName(`Price Book — ${monthYear} ${timeStr}`);
    setShowCreateModal(true);
  };

  const showDetails = (book: PriceBook, editable = false) => {
    setSelectedBook(book);
    setIsEditing(editable);
    setViewMode('services');
    setShowDetailsModal(true);
  };

  const updateService = (serviceId: string, field: keyof Service, value: any) => {
    if (!selectedBook) return;
    const updatedServices = selectedBook.services.map(s =>
      s.id === serviceId ? { ...s, [field]: value } : s
    );
    const updatedBook = { ...selectedBook, services: updatedServices, updatedAt: new Date().toISOString() };
    const updatedBooks = priceBooks.map(b => b.id === selectedBook.id ? updatedBook : b);
    saveBooks(updatedBooks);
    setSelectedBook(updatedBook);
  };

  const updateHoursMatrix = (houseSizeCode: string, serviceCode: string, hours: number) => {
    if (!selectedBook) return;
    const currentMatrix = selectedBook.hoursMatrix || getDefaultHoursMatrix();
    const newMatrix = {
      ...currentMatrix,
      [houseSizeCode]: {
        ...currentMatrix[houseSizeCode],
        [serviceCode]: hours,
      },
    };
    const updatedBook = { ...selectedBook, hoursMatrix: newMatrix, updatedAt: new Date().toISOString() };
    const updatedBooks = priceBooks.map(b => b.id === selectedBook.id ? updatedBook : b);
    saveBooks(updatedBooks);
    setSelectedBook(updatedBook);
  };

  const updateCrewSize = (range: string, field: 'min' | 'prefer', value: number) => {
    if (!selectedBook) return;
    const currentMatrix = selectedBook.crewSizeMatrix || getDefaultCrewSizeMatrix();
    const newMatrix = {
      ...currentMatrix,
      [range]: {
        ...currentMatrix[range],
        [field]: value,
      },
    };
    const updatedBook = { ...selectedBook, crewSizeMatrix: newMatrix, updatedAt: new Date().toISOString() };
    const updatedBooks = priceBooks.map(b => b.id === selectedBook.id ? updatedBook : b);
    saveBooks(updatedBooks);
    setSelectedBook(updatedBook);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Price Books</h1>
          <p className="text-muted-foreground mt-1">Manage your service pricing and rates</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Create Price Book
        </Button>
      </div>

      <div className="space-y-2">
        {priceBooks.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No price books created yet</p>
          </div>
        ) : (
          [...priceBooks]
            .sort((a, b) => {
              if (a.isCurrent && !b.isCurrent) return -1;
              if (!a.isCurrent && b.isCurrent) return 1;
              if (a.status === 'Published' && b.status === 'Draft') return -1;
              if (a.status === 'Draft' && b.status === 'Published') return 1;
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            })
            .map((book) => (
              <div key={book.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant={book.status === 'Published' ? 'default' : 'secondary'}>
                      {book.status}
                    </Badge>
                    {book.isCurrent && (
                      <Badge variant="outline" className="bg-green-50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium">{book.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Updated {new Date(book.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === book.id ? null : book.id);
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  
                  {openDropdown === book.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute right-0 top-full mt-1 z-20 bg-background border rounded-lg shadow-lg py-1 min-w-[160px]">
                        <button
                          onClick={() => { showDetails(book, false); setOpenDropdown(null); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </button>
                        {book.status === 'Draft' && (
                          <button
                            onClick={() => { showDetails(book, true); setOpenDropdown(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => duplicateBook(book)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </button>
                        {book.status === 'Draft' && (
                          <button
                            onClick={() => publishBook(book.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Publish
                          </button>
                        )}
                        {book.status === 'Published' && !book.isCurrent && (
                          <button
                            onClick={() => markAsCurrent(book.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Mark as Current
                          </button>
                        )}
                        <div className="border-t my-1" />
                        <button
                          onClick={() => deleteBook(book.id)}
                          className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Price Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Price Book Name</Label>
              <Input
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="Enter price book name"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBook} disabled={!newBookName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Sheet open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <SheetContent className="max-h-[95vh] p-0 flex flex-col w-full sm:max-w-4xl">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>{selectedBook?.name} - Services & Pricing</SheetTitle>
            {isEditing && (
              <p className="text-sm text-muted-foreground mt-1">Click any cell to edit inline</p>
            )}
          </SheetHeader>

          {selectedBook && (
            <div className="flex-1 overflow-hidden flex flex-col px-6">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="flex flex-col h-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="services">
                    Services ({selectedBook.services.length})
                  </TabsTrigger>
                  <TabsTrigger value="hours">
                    <Clock className="w-4 h-4 mr-2" />
                    Hours Matrix
                  </TabsTrigger>
                  <TabsTrigger value="crew">Crew Size</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto pb-6">
                  <TabsContent value="services" className="m-0">
                    <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase">Code</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase">Service Name</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold uppercase">Unit</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold uppercase">Price</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold uppercase">Off Hours</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold uppercase">Minutes</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold uppercase">Min Qty</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold uppercase">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        selectedBook.services.reduce((acc, service) => {
                          if (!acc[service.category]) acc[service.category] = [];
                          acc[service.category].push(service);
                          return acc;
                        }, {} as Record<string, Service[]>)
                      ).map(([category, services]) => (
                        <React.Fragment key={category}>
                          <tr className="bg-blue-50 dark:bg-blue-950/50">
                            <td colSpan={8} className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                                <span>{category} ({services.length} services)</span>
                              </div>
                            </td>
                          </tr>
                          {services.map((service) => (
                            <tr key={service.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">
                                <code className="text-xs px-2 py-1 bg-muted rounded">{service.code}</code>
                              </td>
                              <td className="py-3 px-4 font-medium">{service.name}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-2 py-1 bg-muted rounded text-sm">{service.unit}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {editingServiceId === `${service.id}-price` ? (
                                  <Input
                                    type="number"
                                    value={service.price}
                                    onChange={(e) => updateService(service.id, 'price', parseFloat(e.target.value) || 0)}
                                    onBlur={() => setEditingServiceId(null)}
                                    className="w-20 text-center"
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    onClick={() => isEditing && setEditingServiceId(`${service.id}-price`)}
                                    className="font-mono font-semibold text-green-600"
                                    disabled={!isEditing}
                                  >
                                    ${service.price}
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {editingServiceId === `${service.id}-offHours` ? (
                                  <Input
                                    type="number"
                                    value={service.offHoursPrice}
                                    onChange={(e) => updateService(service.id, 'offHoursPrice', parseFloat(e.target.value) || 0)}
                                    onBlur={() => setEditingServiceId(null)}
                                    className="w-20 text-center"
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    onClick={() => isEditing && setEditingServiceId(`${service.id}-offHours`)}
                                    className="font-mono font-semibold text-orange-600"
                                    disabled={!isEditing}
                                  >
                                    ${service.offHoursPrice}
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-mono">{service.minutesPerUnit}</span>
                              </td>
                              <td className="py-3 px-4 text-center">{service.minQty.toFixed(1)}</td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => updateService(service.id, 'isAvailable', !service.isAvailable)}
                                  className={`w-6 h-6 rounded-full border-2 ${
                                    service.isAvailable ? 'bg-green-500 border-green-500 text-white' : 'bg-muted border-muted-foreground'
                                  }`}
                                  disabled={!isEditing}
                                >
                                  {service.isAvailable ? '✓' : '✕'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="hours" className="m-0">
                    <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium">Home Size / Service</th>
                        {['STANDARD', 'DEEP', 'MOVE-IN', 'MOVE-OUT'].map(code => (
                          <th key={code} className="py-3 px-4 text-center text-sm font-medium">
                            {code === 'STANDARD' ? 'Standard' : code === 'DEEP' ? 'Deep' : code === 'MOVE-IN' ? 'Move-In' : 'Move-Out'}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {HOME_SIZE_OPTIONS.map((homeSize, index) => {
                        const matrix = selectedBook.hoursMatrix || getDefaultHoursMatrix();
                        return (
                          <tr key={homeSize.sqftRangeCode} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                            <td className="py-3 px-4 text-sm font-medium">{homeSize.sqftLabel}</td>
                            {['STANDARD', 'DEEP', 'MOVE-IN', 'MOVE-OUT'].map(serviceCode => {
                              const hours = matrix[homeSize.sqftRangeCode]?.[serviceCode] || 0;
                              const cellKey = `${homeSize.sqftRangeCode}-${serviceCode}`;
                              return (
                                <td key={serviceCode} className="py-3 px-4 text-center">
                                  {editingHourCell === cellKey ? (
                                    <Input
                                      type="number"
                                      value={hours}
                                      onChange={(e) => updateHoursMatrix(homeSize.sqftRangeCode, serviceCode, parseFloat(e.target.value) || 0)}
                                      onBlur={() => setEditingHourCell(null)}
                                      className="w-16 text-center"
                                      autoFocus
                                    />
                                  ) : (
                                    <button
                                      onClick={() => isEditing && setEditingHourCell(cellKey)}
                                      className="text-sm"
                                      disabled={!isEditing}
                                    >
                                      {hours}
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="crew" className="m-0">
                    <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase">Labor Hours</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold uppercase">Min Cleaners</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold uppercase">Prefer Cleaners</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const crewMatrix = selectedBook.crewSizeMatrix || getDefaultCrewSizeMatrix();
                        const ranges = Object.keys(crewMatrix).sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]));
                        return ranges.map((range, index) => {
                          const crew = crewMatrix[range];
                          return (
                            <tr key={range} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                              <td className="py-3 px-4 font-medium">{range} hours</td>
                              <td className="py-3 px-4 text-center">
                                {editingHourCell === `${range}-min` ? (
                                  <Input
                                    type="number"
                                    value={crew.min}
                                    onChange={(e) => updateCrewSize(range, 'min', parseInt(e.target.value) || 1)}
                                    onBlur={() => setEditingHourCell(null)}
                                    className="w-16 text-center"
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    onClick={() => isEditing && setEditingHourCell(`${range}-min`)}
                                    disabled={!isEditing}
                                  >
                                    {crew.min}
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {editingHourCell === `${range}-prefer` ? (
                                  <Input
                                    type="number"
                                    value={crew.prefer}
                                    onChange={(e) => updateCrewSize(range, 'prefer', parseInt(e.target.value) || 1)}
                                    onBlur={() => setEditingHourCell(null)}
                                    className="w-16 text-center"
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    onClick={() => isEditing && setEditingHourCell(`${range}-prefer`)}
                                    disabled={!isEditing}
                                  >
                                    {crew.prefer}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

