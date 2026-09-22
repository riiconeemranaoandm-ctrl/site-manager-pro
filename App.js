import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  FlatList,
  Modal,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, LogOut, Check, X, Eye, Filter, Download, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react-native';

const STORAGE_KEY = 'siteExpensesV2';
const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#1e40af',
  success: '#059669',
  danger: '#dc2626',
  warning: '#f59e0b',
  dark: '#1f2937',
  light: '#f3f4f6',
  border: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: 'user' });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const [newExpense, setNewExpense] = useState({
    category: 'labour',
    description: '',
    amount: '',
    quantity: '1',
    rate: '',
    date: new Date().toISOString().split('T')[0],
    site: 'Site A',
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const sampleData = [
          {
            id: 1,
            submittedBy: 'John Smith',
            category: 'labour',
            description: '8 hours excavation work',
            amount: 800,
            quantity: 8,
            rate: 100,
            date: '2026-09-18',
            site: 'Site A',
            status: 'approved',
            submittedDate: '2026-09-18T10:00:00',
            approvedBy: 'Admin',
            approvedDate: '2026-09-18T14:30:00',
          },
          {
            id: 2,
            submittedBy: 'Mike Johnson',
            category: 'materials',
            description: 'Cement bags (50kg) - 30 bags',
            amount: 1500,
            quantity: 30,
            rate: 50,
            date: '2026-09-19',
            site: 'Site B',
            status: 'pending',
            submittedDate: '2026-09-19T08:00:00',
            approvedBy: null,
            approvedDate: null,
          },
          {
            id: 3,
            submittedBy: 'Sarah Wilson',
            category: 'equipment',
            description: 'Crane rental - daily rate',
            amount: 500,
            quantity: 1,
            rate: 500,
            date: '2026-09-19',
            site: 'Site A',
            status: 'approved',
            submittedDate: '2026-09-19T09:15:00',
            approvedBy: 'Admin',
            approvedDate: '2026-09-19T11:00:00',
          },
        ];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
        setExpenses(sampleData);
      } else {
        setExpenses(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading:', error);
    }
  };

  const saveExpenses = async (updated) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setExpenses(updated);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleLogin = () => {
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setCurrentUser({ username: loginForm.username, role: loginForm.role });
    setShowLoginModal(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginModal(true);
    setShowExpenseForm(false);
    setLoginForm({ username: '', password: '', role: 'user' });
  };

  const handleSubmitExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const expense = {
      id: Math.max(0, ...expenses.map(e => e.id)) + 1,
      submittedBy: currentUser.username,
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      quantity: parseFloat(newExpense.quantity) || 1,
      rate: parseFloat(newExpense.rate) || parseFloat(newExpense.amount),
      date: newExpense.date,
      site: newExpense.site,
      status: 'pending',
      submittedDate: new Date().toISOString(),
      approvedBy: null,
      approvedDate: null,
    };

    await saveExpenses([...expenses, expense]);
    setShowExpenseForm(false);
    setNewExpense({
      category: 'labour',
      description: '',
      amount: '',
      quantity: '1',
      rate: '',
      date: new Date().toISOString().split('T')[0],
      site: 'Site A',
    });
    Alert.alert('Success', 'Expense submitted for approval');
  };

  const handleApproveExpense = async (id) => {
    const updated = expenses.map(e =>
      e.id === id
        ? { ...e, status: 'approved', approvedBy: currentUser.username, approvedDate: new Date().toISOString() }
        : e
    );
    await saveExpenses(updated);
    Alert.alert('Success', 'Expense approved');
  };

  const handleRejectExpense = async (id) => {
    const updated = expenses.map(e =>
      e.id === id
        ? { ...e, status: 'rejected', approvedBy: currentUser.username, approvedDate: new Date().toISOString() }
        : e
    );
    await saveExpenses(updated);
    Alert.alert('Rejected', 'Expense rejected');
  };

  const getFilteredExpenses = () => {
    let filtered = currentUser.role === 'user'
      ? expenses.filter(e => e.submittedBy === currentUser.username)
      : adminFilter === 'all' ? expenses : expenses.filter(e => e.status === adminFilter);

    if (searchText) {
      filtered = filtered.filter(e =>
        e.description.toLowerCase().includes(searchText.toLowerCase()) ||
        e.submittedBy.toLowerCase().includes(searchText.toLowerCase()) ||
        e.site.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return filtered;
  };

  const calculateStats = () => {
    const filtered = getFilteredExpenses();
    return {
      total: filtered.reduce((sum, e) => sum + e.amount, 0),
      approved: filtered.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0),
      pending: filtered.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
      rejected: filtered.filter(e => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0),
      count: filtered.length,
    };
  };

  const getSiteStats = () => {
    const sites = {};
    expenses.forEach(e => {
      if (!sites[e.site]) sites[e.site] = 0;
      sites[e.site] += e.amount;
    });
    return sites;
  };

  const getCategoryStats = () => {
    const categories = {};
    expenses.forEach(e => {
      if (!categories[e.category]) categories[e.category] = 0;
      categories[e.category] += e.amount;
    });
    return categories;
  };

  const stats = calculateStats();
  const filteredExpenses = getFilteredExpenses();
  const siteStats = getSiteStats();
  const categoryStats = getCategoryStats();

  // LOGIN SCREEN
  if (showLoginModal) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.light} />
        <View style={styles.loginContainer}>
          <View style={styles.loginCard}>
            <View style={styles.loginHeader}>
              <View style={styles.logoCircle}>
                <DollarSign size={40} color="#fff" />
              </View>
              <Text style={styles.loginTitle}>Site Manager</Text>
              <Text style={styles.loginSubtitle}>Construction Expense Tracker</Text>
            </View>

            <View style={styles.loginForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  value={loginForm.username}
                  onChangeText={(text) => setLoginForm({ ...loginForm, username: text })}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
                  secureTextEntry
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleButtonsContainer}>
                  {[
                    { label: 'Worker', value: 'user' },
                    { label: 'Admin', value: 'admin' },
                  ].map(role => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleButton,
                        loginForm.role === role.value && styles.roleButtonActive,
                      ]}
                      onPress={() => setLoginForm({ ...loginForm, role: role.value })}
                    >
                      <Text style={[styles.roleButtonText, loginForm.role === role.value && styles.roleButtonTextActive]}>
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>

              <Text style={styles.demoText}>Demo: Any username & password</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN APP
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.light} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{currentUser.role === 'admin' ? '📊 Admin Panel' : '💼 My Expenses'}</Text>
          <Text style={styles.headerUser}>{currentUser.username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        {currentUser.role === 'user' ? (
          <>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'dashboard' && styles.tabActive]}
              onPress={() => setActiveTab('dashboard')}
            >
              <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
              onPress={() => setActiveTab('expenses')}
            >
              <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>My Expenses</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'dashboard' && styles.tabActive]}
              onPress={() => setActiveTab('dashboard')}
            >
              <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
              onPress={() => setActiveTab('pending')}
            >
              <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Approvals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
              onPress={() => setActiveTab('expenses')}
            >
              <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>All Expenses</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <View>
            {/* STATS CARDS */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
                <View style={styles.statIcon}>
                  <DollarSign size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>${stats.total.toFixed(0)}</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#ecfdf5' }]}>
                <View style={styles.statIcon}>
                  <CheckCircle size={24} color={COLORS.success} />
                </View>
                <Text style={styles.statLabel}>Approved</Text>
                <Text style={[styles.statValue, { color: COLORS.success }]}>${stats.approved.toFixed(0)}</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
                <View style={styles.statIcon}>
                  <Clock size={24} color={COLORS.warning} />
                </View>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={[styles.statValue, { color: COLORS.warning }]}>${stats.pending.toFixed(0)}</Text>
              </View>

              {currentUser.role === 'admin' && (
                <View style={[styles.statCard, { backgroundColor: '#f3f4f6' }]}>
                  <View style={styles.statIcon}>
                    <TrendingUp size={24} color={COLORS.dark} />
                  </View>
                  <Text style={styles.statLabel}>Entries</Text>
                  <Text style={styles.statValue}>{stats.count}</Text>
                </View>
              )}
            </View>

            {/* SITE BREAKDOWN */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💼 By Site</Text>
              {Object.entries(siteStats).map(([site, amount]) => (
                <View key={site} style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>{site}</Text>
                  <Text style={styles.breakdownValue}>${amount.toFixed(0)}</Text>
                </View>
              ))}
            </View>

            {/* CATEGORY BREAKDOWN */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏷️ By Category</Text>
              {Object.entries(categoryStats).map(([category, amount]) => (
                <View key={category} style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                  <Text style={styles.breakdownValue}>${amount.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SUBMIT EXPENSE (Worker) */}
        {activeTab === 'dashboard' && currentUser.role === 'user' && !showExpenseForm && (
          <TouchableOpacity style={styles.submitBtn} onPress={() => setShowExpenseForm(true)}>
            <Plus size={22} color="#fff" />
            <Text style={styles.submitBtnText}>Submit New Expense</Text>
          </TouchableOpacity>
        )}

        {/* EXPENSE FORM */}
        {showExpenseForm && currentUser.role === 'user' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Submit Expense</Text>
            <View style={styles.formBox}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {['labour', 'materials', 'equipment', 'transport', 'other'].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryBtn,
                        newExpense.category === cat && styles.categoryBtnActive,
                      ]}
                      onPress={() => setNewExpense({ ...newExpense, category: cat })}
                    >
                      <Text style={[styles.categoryBtnText, newExpense.category === cat && styles.categoryBtnTextActive]}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Site</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['Site A', 'Site B', 'Site C'].map(site => (
                    <TouchableOpacity
                      key={site}
                      style={[
                        styles.categoryBtn,
                        newExpense.site === site && styles.categoryBtnActive,
                      ]}
                      onPress={() => setNewExpense({ ...newExpense, site })}
                    >
                      <Text style={[styles.categoryBtnText, newExpense.site === site && styles.categoryBtnTextActive]}>
                        {site}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What is this expense for?"
                  value={newExpense.description}
                  onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Qty"
                    value={newExpense.quantity}
                    onChangeText={(text) => setNewExpense({ ...newExpense, quantity: text })}
                    keyboardType="decimal-pad"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Rate</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="$/Unit"
                    value={newExpense.rate}
                    onChangeText={(text) => setNewExpense({ ...newExpense, rate: text })}
                    keyboardType="decimal-pad"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Amount *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Total"
                    value={newExpense.amount}
                    onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                    keyboardType="decimal-pad"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newExpense.date}
                  onChangeText={(text) => setNewExpense({ ...newExpense, date: text })}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitExpense}>
                  <Check size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowExpenseForm(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* FILTER & SEARCH */}
        {(activeTab === 'expenses' || activeTab === 'pending') && (
          <View style={styles.section}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Search by name, site, or description"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={COLORS.textSecondary}
            />

            {currentUser.role === 'admin' && activeTab === 'expenses' && (
              <View style={styles.filterContainer}>
                {['all', 'pending', 'approved', 'rejected'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterBtn,
                      adminFilter === status && styles.filterBtnActive,
                    ]}
                    onPress={() => setAdminFilter(status)}
                  >
                    <Text style={[styles.filterBtnText, adminFilter === status && styles.filterBtnTextActive]}>
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {currentUser.role === 'admin' && activeTab === 'pending' && (
              <Text style={styles.sectionSubtitle}>Showing {filteredExpenses.filter(e => e.status === 'pending').length} pending approvals</Text>
            )}
          </View>
        )}

        {/* EXPENSES LIST */}
        <View style={styles.section}>
          {filteredExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No expenses found</Text>
            </View>
          ) : (
            filteredExpenses
              .filter(e => activeTab === 'pending' ? e.status === 'pending' : true)
              .map(expense => (
                <View key={expense.id} style={styles.expenseCardContainer}>
                  <View style={styles.expenseCard}>
                    <View style={styles.expenseHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.expenseTitle}>{expense.description}</Text>
                        <Text style={styles.expenseSubtext}>
                          {new Date(expense.date).toLocaleDateString()} • {expense.site}
                        </Text>
                      </View>
                      <View style={styles.expenseAmount}>
                        <Text style={styles.expenseAmountValue}>${expense.amount.toFixed(2)}</Text>
                      </View>
                    </View>

                    <View style={styles.expenseDetails}>
                      <View style={styles.detailBadge}>
                        <Text style={styles.detailBadgeLabel}>Category</Text>
                        <Text style={styles.detailBadgeValue}>{expense.category}</Text>
                      </View>
                      <View style={styles.detailBadge}>
                        <Text style={styles.detailBadgeLabel}>Qty × Rate</Text>
                        <Text style={styles.detailBadgeValue}>{expense.quantity} × ${expense.rate}</Text>
                      </View>
                      <View style={styles.detailBadge}>
                        <Text style={styles.detailBadgeLabel}>By</Text>
                        <Text style={styles.detailBadgeValue}>{expense.submittedBy}</Text>
                      </View>
                    </View>

                    <View style={styles.expenseFooter}>
                      <View style={[
                        styles.statusBadge,
                        expense.status === 'approved' && styles.statusApproved,
                        expense.status === 'rejected' && styles.statusRejected,
                        expense.status === 'pending' && styles.statusPending,
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          expense.status === 'approved' && styles.statusApprovedText,
                          expense.status === 'rejected' && styles.statusRejectedText,
                          expense.status === 'pending' && styles.statusPendingText,
                        ]}>
                          {expense.status.toUpperCase()}
                        </Text>
                      </View>

                      {currentUser.role === 'admin' && expense.status === 'pending' && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={() => handleApproveExpense(expense.id)}
                          >
                            <Check size={16} color="#fff" />
                            <Text style={styles.approveBtnText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => handleRejectExpense(expense.id)}
                          >
                            <X size={16} color="#fff" />
                            <Text style={styles.rejectBtnText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginForm: {
    gap: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#fafbfc',
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#eff6ff',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleButtonTextActive: {
    color: COLORS.primary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerUser: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  formBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryScroll: {
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  categoryBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryBtnTextActive: {
    color: '#fff',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  expenseCardContainer: {
    marginBottom: 12,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  expenseSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  expenseAmount: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  expenseAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  expenseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    backgroundColor: '#fafbfc',
  },
  detailBadge: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  detailBadgeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  detailBadgeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusApprovedText: {
    color: COLORS.success,
  },
  statusRejectedText: {
    color: COLORS.danger,
  },
  statusPendingText: {
    color: COLORS.warning,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  approveBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  rejectBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default App;
