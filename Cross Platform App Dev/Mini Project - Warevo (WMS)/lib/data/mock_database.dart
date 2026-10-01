class LocationItem {
  final String id;
  final String name;
  final String type; // 'warehouse' | 'store' | 'dark_store'
  final String city;
  final String status; // 'live' | 'stale' | 'quarantined'
  final String syncAge;
  final String? details;
  final double trustScore;
  final int totalBins;
  final int totalStock;
  final String? connector;

  LocationItem({
    required this.id,
    required this.name,
    required this.type,
    required this.city,
    required this.status,
    required this.syncAge,
    this.details,
    this.trustScore = 0.95,
    this.totalBins = 0,
    this.totalStock = 0,
    this.connector,
  });
}

class ProductSku {
  final String code;
  final String name;
  final String category;
  final String barcode;
  final int mrp;
  final int cost;
  final int onHand;
  final int reserved;
  final int available;
  final int inTransit;
  final Map<String, int> warehouseBins;
  final Map<String, int> storeStock;

  ProductSku({
    required this.code,
    required this.name,
    required this.category,
    required this.barcode,
    required this.mrp,
    required this.cost,
    required this.onHand,
    required this.reserved,
    required this.available,
    required this.inTransit,
    required this.warehouseBins,
    required this.storeStock,
  });
}

class AttemptStep {
  final int step;
  final String locationName;
  final double score;
  final String offeredTime;
  final String? outcome; // 'offered' | 'accepted' | 'rejected' | 'timed_out'
  final String? reason;
  final String delay;
  final String cost;

  AttemptStep({
    required this.step,
    required this.locationName,
    required this.score,
    required this.offeredTime,
    this.outcome,
    this.reason,
    this.delay = '+0 min',
    this.cost = '+₹0',
  });
}

class OrderItem {
  final String id;
  final String customerArea;
  final String customerCity;
  final double distanceKm;
  final int itemCount;
  final int totalAmount;
  final String placedTime;
  final String source; // 'Shopify' | 'Myntra' | 'Store POS'
  String status; // 'offered' | 'picking' | 'ready_pickup' | 'dispatched' | 'exhausted'
  String currentLocation;
  int remainingSeconds; // Countdown for acceptance
  final List<AttemptStep> attemptChain;
  final List<Map<String, dynamic>> items;

  OrderItem({
    required this.id,
    required this.customerArea,
    required this.customerCity,
    required this.distanceKm,
    required this.itemCount,
    required this.totalAmount,
    required this.placedTime,
    required this.source,
    required this.status,
    required this.currentLocation,
    required this.remainingSeconds,
    required this.attemptChain,
    required this.items,
  });
}

class StockLedgerEntry {
  final String id;
  final String type; // 'PICK' | 'PUTAWAY' | 'RECEIPT' | 'ADJUST'
  final String sku;
  final String fromBin;
  final String toBin;
  final int deltaQty;
  final String operatorName;
  final String timestamp;
  final String referenceDoc;

  StockLedgerEntry({
    required this.id,
    required this.type,
    required this.sku,
    required this.fromBin,
    required this.toBin,
    required this.deltaQty,
    required this.operatorName,
    required this.timestamp,
    required this.referenceDoc,
  });
}

class TenantMetric {
  final String name;
  final String plan;
  final String status; // 'active' | 'trial' | 'past_due'
  final int mrr;
  final int users;
  final int locations;
  final int marginPercent;
  final int firebaseCost;
  final String since;
  final String? alert;

  TenantMetric({
    required this.name,
    required this.plan,
    required this.status,
    required this.mrr,
    required this.users,
    required this.locations,
    required this.marginPercent,
    required this.firebaseCost,
    required this.since,
    this.alert,
  });
}

class MockDatabase {
  static final List<LocationItem> locations = [
    LocationItem(
      id: 'LOC-WH1',
      name: 'Bhiwandi DC',
      type: 'warehouse',
      city: 'Mumbai',
      status: 'live',
      syncAge: 'Synced 2m ago',
      details: '6 zones · 2,304 bins',
      trustScore: 0.99,
      totalBins: 2304,
      totalStock: 582400,
    ),
    LocationItem(
      id: 'LOC-ST01',
      name: 'Phoenix Palassio',
      type: 'store',
      city: 'Lucknow',
      status: 'live',
      syncAge: 'POS synced 3m ago',
      details: 'Ginesys POS · 3 walk-ins',
      trustScore: 0.94,
      totalBins: 1,
      totalStock: 3420,
      connector: 'Ginesys POS',
    ),
    LocationItem(
      id: 'LOC-ST02',
      name: 'Phoenix Citadel',
      type: 'store',
      city: 'Indore',
      status: 'stale',
      syncAge: 'POS stale 18 min',
      details: 'Shopify POS · Sync pending',
      trustScore: 0.88,
      totalBins: 1,
      totalStock: 2890,
      connector: 'Shopify POS',
    ),
    LocationItem(
      id: 'LOC-ST03',
      name: 'Model Town',
      type: 'store',
      city: 'Ghaziabad',
      status: 'quarantined',
      syncAge: 'POS stale 47 min',
      details: 'Stock went negative on 2 SKUs · excluded',
      trustScore: 0.41,
      totalBins: 1,
      totalStock: 1940,
      connector: 'Ginesys POS',
    ),
    LocationItem(
      id: 'LOC-ST04',
      name: 'Select Citywalk',
      type: 'store',
      city: 'New Delhi',
      status: 'live',
      syncAge: 'POS synced 1m ago',
      details: 'Ginesys POS',
      trustScore: 0.96,
      totalBins: 1,
      totalStock: 4120,
      connector: 'Ginesys POS',
    ),
    LocationItem(
      id: 'LOC-ST05',
      name: 'VR Mall',
      type: 'store',
      city: 'Bengaluru',
      status: 'live',
      syncAge: 'POS synced 4m ago',
      details: 'Ginesys POS',
      trustScore: 0.93,
      totalBins: 1,
      totalStock: 3810,
      connector: 'Ginesys POS',
    ),
    LocationItem(
      id: 'LOC-ST06',
      name: 'Palladium',
      type: 'store',
      city: 'Ahmedabad',
      status: 'live',
      syncAge: 'POS synced 5m ago',
      details: 'Ginesys POS',
      trustScore: 0.95,
      totalBins: 1,
      totalStock: 3200,
      connector: 'Ginesys POS',
    ),
  ];

  static final List<ProductSku> products = [
    ProductSku(
      code: 'ASH-TEE-OVS-BLK-M',
      name: 'Oversized Tee · Black · M',
      category: "Men's Apparel",
      barcode: '890432190812',
      mrp: 1299,
      cost: 410,
      onHand: 66,
      reserved: 14,
      available: 52,
      inTransit: 24,
      warehouseBins: {
        'WH1-A-03-02': 48,
        'WH1-A-03-05': 12,
        'RECEIVING-01': 6,
      },
      storeStock: {
        'Phoenix Palassio': 3,
        'Phoenix Citadel': 0,
        'Model Town': 7,
      },
    ),
    ProductSku(
      code: 'ASH-TEE-OVS-BLK-L',
      name: 'Oversized Tee · Black · L',
      category: "Men's Apparel",
      barcode: '890432190813',
      mrp: 1299,
      cost: 410,
      onHand: 84,
      reserved: 22,
      available: 62,
      inTransit: 12,
      warehouseBins: {
        'WH1-A-03-03': 60,
        'WH1-A-03-04': 24,
      },
      storeStock: {
        'Phoenix Palassio': 0,
        'Phoenix Citadel': 7,
        'Model Town': 2,
      },
    ),
    ProductSku(
      code: 'ASH-CRG-OLV-32',
      name: 'Cargo Trousers · Olive · 32',
      category: "Men's Bottoms",
      barcode: '890432191455',
      mrp: 2499,
      cost: 890,
      onHand: 42,
      reserved: 8,
      available: 34,
      inTransit: 8,
      warehouseBins: {
        'WH1-B-01-04': 36,
        'WH1-B-01-05': 6,
      },
      storeStock: {
        'Phoenix Palassio': 2,
        'Phoenix Citadel': 8,
        'Model Town': 1,
      },
    ),
    ProductSku(
      code: 'ASH-LIN-WHT-XL',
      name: 'Linen Regular Shirt · White · XL',
      category: "Men's Shirts",
      barcode: '890432192008',
      mrp: 1999,
      cost: 650,
      onHand: 112,
      reserved: 19,
      available: 93,
      inTransit: 30,
      warehouseBins: {
        'WH1-C-02-01': 80,
        'WH1-C-02-02': 32,
      },
      storeStock: {
        'Phoenix Palassio': 5,
        'Phoenix Citadel': 4,
        'Model Town': 0,
      },
    ),
  ];

  static final List<OrderItem> orders = [
    OrderItem(
      id: '#ORD-88213',
      customerArea: 'Gomti Nagar',
      customerCity: 'Lucknow',
      distanceKm: 4.2,
      itemCount: 2,
      totalAmount: 2598,
      placedTime: '09:12',
      source: 'Shopify',
      status: 'offered',
      currentLocation: 'Phoenix Palassio',
      remainingSeconds: 760, // 12:40
      attemptChain: [
        AttemptStep(
          step: 1,
          locationName: 'Phoenix Palassio',
          score: 0.94,
          offeredTime: '09:12',
          outcome: 'offered',
        ),
        AttemptStep(
          step: 2,
          locationName: 'Phoenix Citadel',
          score: 0.88,
          offeredTime: 'Standby',
          delay: '+6 min',
          cost: '+₹60',
        ),
        AttemptStep(
          step: 3,
          locationName: 'Bhiwandi DC',
          score: 0.99,
          offeredTime: 'Fallback',
          delay: '+48 hrs',
          cost: '+₹140',
        ),
      ],
      items: [
        {
          'sku': 'ASH-TEE-OVS-BLK-M',
          'name': 'Oversized Tee · Black · M',
          'qty': 1,
          'inStock': 3,
          'confidence': '94%',
        },
        {
          'sku': 'ASH-CRG-OLV-32',
          'name': 'Cargo Trousers · Olive · 32',
          'qty': 1,
          'inStock': 2,
          'confidence': '91%',
        },
      ],
    ),
    OrderItem(
      id: '#ORD-88240',
      customerArea: 'Hazratganj',
      customerCity: 'Lucknow',
      distanceKm: 2.8,
      itemCount: 1,
      totalAmount: 1299,
      placedTime: '09:35',
      source: 'Shopify',
      status: 'offered',
      currentLocation: 'Phoenix Palassio',
      remainingSeconds: 190, // 03:10
      attemptChain: [
        AttemptStep(
          step: 1,
          locationName: 'Phoenix Palassio',
          score: 0.94,
          offeredTime: '09:35',
          outcome: 'offered',
        ),
      ],
      items: [
        {
          'sku': 'ASH-TEE-OVS-BLK-M',
          'name': 'Oversized Tee · Black · M',
          'qty': 1,
          'inStock': 3,
          'confidence': '94%',
        },
      ],
    ),
    OrderItem(
      id: '#ORD-88190',
      customerArea: 'Aliganj',
      customerCity: 'Lucknow',
      distanceKm: 6.1,
      itemCount: 2,
      totalAmount: 3298,
      placedTime: '08:45',
      source: 'Shopify Click & Collect',
      status: 'ready_pickup',
      currentLocation: 'Phoenix Palassio',
      remainingSeconds: 0,
      attemptChain: [
        AttemptStep(
          step: 1,
          locationName: 'Phoenix Palassio',
          score: 0.96,
          offeredTime: '08:45',
          outcome: 'accepted',
        ),
      ],
      items: [
        {
          'sku': 'ASH-LIN-WHT-XL',
          'name': 'Linen Regular Shirt · White · XL',
          'qty': 1,
          'inStock': 5,
          'confidence': '98%',
        },
        {
          'sku': 'ASH-TEE-OVS-BLK-M',
          'name': 'Oversized Tee · Black · M',
          'qty': 1,
          'inStock': 3,
          'confidence': '94%',
        },
      ],
    ),
    OrderItem(
      id: '#ORD-88094',
      customerArea: 'Indirapuram',
      customerCity: 'Ghaziabad',
      distanceKm: 3.5,
      itemCount: 2,
      totalAmount: 2598,
      placedTime: '08:00',
      source: 'Shopify',
      status: 'exhausted',
      currentLocation: 'Unassigned',
      remainingSeconds: 0,
      attemptChain: [
        AttemptStep(
          step: 1,
          locationName: 'Model Town',
          score: 0.41,
          offeredTime: '08:00',
          outcome: 'rejected',
          reason: "Can't find it",
        ),
        AttemptStep(
          step: 2,
          locationName: 'Phoenix Citadel',
          score: 0.88,
          offeredTime: '08:15',
          outcome: 'timed_out',
          reason: 'No staff response',
        ),
        AttemptStep(
          step: 3,
          locationName: 'Bhiwandi DC',
          score: 0.99,
          offeredTime: '08:35',
          outcome: 'rejected',
          reason: 'No capacity before cut-off',
        ),
      ],
      items: [
        {
          'sku': 'ASH-TEE-OVS-BLK-M',
          'name': 'Oversized Tee · Black · M',
          'qty': 2,
          'inStock': 0,
          'confidence': '0%',
        },
      ],
    ),
  ];

  static final List<StockLedgerEntry> ledgerEntries = [
    StockLedgerEntry(
      id: 'TXN-9021',
      type: 'PICK',
      sku: 'ASH-TEE-OVS-BLK-M',
      fromBin: 'WH1-A-03-02',
      toBin: 'PACKING-01',
      deltaQty: -4,
      operatorName: 'Ravi',
      timestamp: '10:42',
      referenceDoc: 'SO-2026-0417',
    ),
    StockLedgerEntry(
      id: 'TXN-9020',
      type: 'RECEIPT',
      sku: 'ASH-LIN-WHT-XL',
      fromBin: 'DOCK-IN',
      toBin: 'RECEIVING-01',
      deltaQty: 48,
      operatorName: 'Suresh',
      timestamp: '10:15',
      referenceDoc: 'PO-2026-0089',
    ),
    StockLedgerEntry(
      id: 'TXN-9019',
      type: 'PUTAWAY',
      sku: 'ASH-CRG-OLV-32',
      fromBin: 'RECEIVING-01',
      toBin: 'WH1-B-01-04',
      deltaQty: 36,
      operatorName: 'Meena',
      timestamp: '09:50',
      referenceDoc: 'GRN-2026-0142',
    ),
    StockLedgerEntry(
      id: 'TXN-9018',
      type: 'ADJUST',
      sku: 'ASH-TEE-OVS-BLK-M',
      fromBin: 'WH1-B-01-04',
      toBin: 'DAMAGED-HOLD',
      deltaQty: -200,
      operatorName: 'Ravi',
      timestamp: '09:15',
      referenceDoc: 'ADJ-2026-0012',
    ),
  ];

  static final List<TenantMetric> superAdminTenants = [
    TenantMetric(
      name: 'Ashva Apparel',
      plan: 'Growth plan',
      status: 'active',
      mrr: 12000,
      users: 14,
      locations: 41,
      marginPercent: -19,
      firebaseCost: 14300,
      since: 'Mar 2026',
      alert: 'Firebase ₹14,300 exceeds subscription ₹12,000 (92% POS reads)',
    ),
    TenantMetric(
      name: 'Kora Beauty',
      plan: 'Scale plan',
      status: 'active',
      mrr: 35000,
      users: 48,
      locations: 72,
      marginPercent: 44,
      firebaseCost: 19600,
      since: 'Jan 2026',
      alert: '6 connectors failing for 2h 14m',
    ),
    TenantMetric(
      name: 'Bloom Kids',
      plan: 'Starter trial',
      status: 'trial',
      mrr: 8000,
      users: 6,
      locations: 12,
      marginPercent: 62,
      firebaseCost: 3040,
      since: 'Sep 2026',
      alert: 'Trial expires in 3 days',
    ),
    TenantMetric(
      name: 'Trail & Co',
      plan: 'Growth plan',
      status: 'active',
      mrr: 16000,
      users: 22,
      locations: 28,
      marginPercent: 51,
      firebaseCost: 7840,
      since: 'Feb 2026',
    ),
    TenantMetric(
      name: 'Nimbus Home',
      plan: 'Starter plan',
      status: 'past_due',
      mrr: 8000,
      users: 5,
      locations: 8,
      marginPercent: 12,
      firebaseCost: 7040,
      since: 'Nov 2025',
      alert: 'Payment failed 3rd time · ₹8,000',
    ),
  ];
}
