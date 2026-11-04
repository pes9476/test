import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

type Case = {
  rule_code: string;
  risk_score: number;
  target_wallet: string;
  evidence: {reason: string};
};

type TickerItem = {
  id: number;
  from: string;
  to: string;
  amount: string;
  isWhale: boolean;
};

const initialTicker: TickerItem[] = [
  {id: 1, from: '0x28c6... (Binance)', to: '0x71c2...', amount: '50,000.00', isWhale: true},
  {id: 2, from: '0x89a1...', to: '0x11b9...', amount: '120.00', isWhale: false},
  {id: 3, from: '0xfe42...', to: '0x98ca...', amount: '450.00', isWhale: false},
];

function WalletScreen() {
  const [toWallet, setToWallet] = useState('0x46340b20830761efd32832A74d7169B29FEB9758');
  const [amount, setAmount] = useState('980.00');
  const [statusMsg, setStatusMsg] = useState('');
  const [cases, setCases] = useState<Case[]>([]);
  const [tickerList, setTickerList] = useState<TickerItem[]>(initialTicker);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const amounts = ['250.00', '1,500.00', '80.00', '980.00', '12,000.00'];
      const nextAmount = amounts[Math.floor(Math.random() * amounts.length)];
      const from = Math.random().toString(16).slice(2, 6);
      const to = Math.random().toString(16).slice(2, 6);
      setTickerList(previous => [
        {
          id: Date.now(),
          from: `0x${from}...`,
          to: `0x${to}...`,
          amount: nextAmount,
          isWhale: Number(nextAmount.replace(',', '')) >= 10000,
        },
        ...previous.slice(0, 4),
      ]);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleTransfer = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    setStatusMsg('⏳ 데모 거래를 검증 중입니다...');
    setTimeout(() => {
      const value = Number(amount.replace(',', ''));
      if (value >= 900 && value <= 990) {
        setStatusMsg('🚨 [FDS 차단 · 데모] R02_SMURFING: 900~990 USDT 거래 감시 패턴 탐지');
        setCases(previous => [
          {
            rule_code: 'R02_SMURFING',
            risk_score: 94.5,
            target_wallet: toWallet,
            evidence: {reason: '트래블룰 보고 한도 직하 반복 거래 의심'},
          },
          ...previous,
        ]);
      } else if (Number.isFinite(value) && value > 0 && toWallet.trim()) {
        setStatusMsg(`✅ [데모 승인] ${amount} USDT 거래 검증 완료`);
      } else {
        setStatusMsg('송금 수량과 수신 지갑 주소를 확인해 주세요.');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.appBar}>
          <Text style={styles.brandTitle}>🛡️ Aegis Wallet</Text>
          <View style={styles.networkBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.networkText}>ETH Live</Text>
          </View>
        </View>

        <View style={styles.assetCard}>
          <Text style={styles.assetLabel}>보유 가용 자산 (Total Balance)</Text>
          <Text style={styles.assetAmount}>
            50,000.00 <Text style={styles.usdtUnit}>USDT</Text>
          </Text>
          <Text style={styles.secureBadge}>🔒 FDS 실시간 이상거래 보호 활성화</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💸 USDT 송금하기</Text>
            <Text style={styles.travelRuleTag}>특금법 트래블룰 적용</Text>
          </View>
          <Text style={styles.inputLabel}>수신 지갑 주소</Text>
          <TextInput
            style={styles.inputBox}
            value={toWallet}
            onChangeText={setToWallet}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="수신 지갑 주소"
          />
          <Text style={styles.inputLabel}>송금 수량 (USDT)</Text>
          <TextInput
            style={styles.inputBox}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            accessibilityLabel="송금 수량"
          />
          <TouchableOpacity
            style={[styles.btnSend, loading && styles.btnDisabled]}
            onPress={handleTransfer}
            disabled={loading}
            accessibilityRole="button">
            <Text style={styles.btnText}>
              {loading ? 'FDS 분석 중...' : '안심 송금 및 사전 검증 요청 (데모)'}
            </Text>
          </TouchableOpacity>
          {statusMsg ? <Text style={styles.statusResult}>{statusMsg}</Text> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.feedHeader}>
            <View style={styles.redDot} />
            <Text style={styles.feedTitle}>FDS 실시간 위협 감시 피드</Text>
          </View>
          {cases.length === 0 ? (
            <Text style={styles.emptyFeed}>현재 감지된 이상거래가 없습니다.</Text>
          ) : (
            cases.slice(0, 3).map((item, index) => (
              <View key={`${item.rule_code}-${index}`} style={styles.alertBox}>
                <View style={styles.alertTop}>
                  <Text style={styles.alertRule}>🚨 [{item.rule_code}]</Text>
                  <Text style={styles.alertScore}>위험도 {item.risk_score}점</Text>
                </View>
                <Text style={styles.alertReason}>{item.evidence.reason}</Text>
                <Text style={styles.alertTarget}>대상 지갑: {item.target_wallet}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.tickerHeader}>
            <View style={styles.blueDot} />
            <Text style={styles.tickerTitle}>🌐 이더리움 메인넷 실시간 거래 스트림</Text>
          </View>
          <View style={styles.tickerList}>
            {tickerList.map(item => (
              <View
                key={item.id}
                style={[styles.tickerRow, item.isWhale && styles.tickerWhale]}>
                <Text style={styles.tickerAddr}>
                  {item.from} ➔ {item.to}
                </Text>
                <Text style={[styles.tickerAmt, item.isWhale && styles.tickerAmtWhale]}>
                  {item.amount} USDT
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <WalletScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#030712'},
  content: {padding: 16, paddingBottom: 28},
  appBar: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  brandTitle: {fontSize: 18, fontWeight: '800', color: '#f8fafc'},
  networkBadge: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12},
  greenDot: {width: 6, height: 6, backgroundColor: '#10b981', borderRadius: 3, marginRight: 5},
  networkText: {fontSize: 10, color: '#38bdf8', fontWeight: '700'},
  assetCard: {backgroundColor: '#0f172a', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#312e81'},
  assetLabel: {fontSize: 11, color: '#94a3b8'},
  assetAmount: {fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 3},
  usdtUnit: {fontSize: 13, color: '#38bdf8'},
  secureBadge: {fontSize: 10, color: '#34d399', marginTop: 6, fontWeight: '500'},
  card: {backgroundColor: '#111827', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#1f2937', marginBottom: 12},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  cardTitle: {fontSize: 12, fontWeight: '700', color: '#f1f5f9'},
  travelRuleTag: {fontSize: 9, backgroundColor: '#3730a3', color: '#c7d2fe', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, fontWeight: '600'},
  inputLabel: {fontSize: 10, color: '#94a3b8', fontWeight: '700', marginTop: 7, marginBottom: 4},
  inputBox: {backgroundColor: '#030712', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 9, color: '#f8fafc', fontSize: 12, fontFamily: 'monospace'},
  btnSend: {backgroundColor: '#2563eb', padding: 12, borderRadius: 10, marginTop: 12, alignItems: 'center'},
  btnDisabled: {opacity: 0.6},
  btnText: {color: '#fff', fontWeight: '700', fontSize: 12},
  statusResult: {fontSize: 11, color: '#f87171', marginTop: 8, textAlign: 'center', fontWeight: '600'},
  feedHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  redDot: {width: 6, height: 6, backgroundColor: '#ef4444', borderRadius: 3, marginRight: 5},
  feedTitle: {fontSize: 11, fontWeight: '700', color: '#94a3b8'},
  emptyFeed: {fontSize: 10, color: '#64748b', textAlign: 'center', marginVertical: 8},
  alertBox: {backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeftWidth: 3, borderLeftColor: '#ef4444', borderRadius: 6, padding: 7, marginTop: 5},
  alertTop: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2},
  alertRule: {color: '#f87171', fontSize: 10, fontWeight: '800'},
  alertScore: {color: '#f87171', fontSize: 9, fontWeight: '700'},
  alertReason: {color: '#e2e8f0', fontSize: 10, marginTop: 1},
  alertTarget: {color: '#64748b', fontSize: 9, marginTop: 2},
  tickerHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  blueDot: {width: 6, height: 6, backgroundColor: '#38bdf8', borderRadius: 3, marginRight: 5},
  tickerTitle: {fontSize: 10, fontWeight: '700', color: '#38bdf8'},
  tickerList: {gap: 4},
  tickerRow: {flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#030712', padding: 6, borderRadius: 6, borderLeftWidth: 2, borderLeftColor: '#38bdf8'},
  tickerWhale: {borderLeftColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.08)'},
  tickerAddr: {fontSize: 9, color: '#94a3b8', fontFamily: 'monospace'},
  tickerAmt: {fontSize: 9, color: '#38bdf8', fontWeight: 'bold'},
  tickerAmtWhale: {color: '#eab308'},
});

export default App;
