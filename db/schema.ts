import {sqliteTable,text,integer,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const maps = sqliteTable('maps',{
  ownerHash:text('owner_hash'),
  id:text('id').primaryKey(),
  nickname:text('nickname').notNull(),
  mbti:text('mbti').notNull(),
  createdAt:integer('created_at').notNull(),
});
export const friends=sqliteTable('friends',{
 relationship:text('relationship'),
 id:text('id').primaryKey(),
 mapId:text('map_id').notNull().references(()=>maps.id,{onDelete:'cascade'}),
 nickname:text('nickname').notNull(),
 mbti:text('mbti').notNull(),
 createdAt:integer('created_at').notNull(),
},table=>[uniqueIndex('idx_friends_map_nickname_mbti').on(table.mapId,table.nickname,table.mbti)]);
export const orders=sqliteTable('orders',{
 id:text('id').primaryKey(),buyerHash:text('buyer_hash').notNull(),mapId:text('map_id').notNull(),friendId:text('friend_id').notNull(),
 amount:integer('amount').notNull(),mode:text('mode').notNull(),status:text('status').notNull(),paymentKey:text('payment_key'),report:text('report').notNull(),createdAt:integer('created_at').notNull(),
},table=>[uniqueIndex('idx_orders_purchase').on(table.buyerHash,table.mapId,table.friendId,table.mode),uniqueIndex('idx_orders_payment').on(table.paymentKey)]);
