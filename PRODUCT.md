# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Laravel, React, Inertia.js, Tailwind CSS, shadcn/ui

## Users

- **Admins & Managers:** Setting up the restaurant, overseeing operations, reviewing live stock, and configuring the menu.
- **Cashiers & Waitstaff:** Operating the POS terminal, opening and checking out dine-in tables, taking orders.
- **Kitchen Staff:** Utilizing the Kitchen Display System (KDS) for real-time order tracking.

## Product Purpose

A full-stack restaurant management system (Cue Eats) handling Point of Sale (POS), dine-in table management, kitchen order routing, and inventory/supply chain management. It connects front-of-house operations with back-of-house fulfillment.

## Positioning

A unified, real-time command center for restaurants that eliminates the gap between the POS, the kitchen, and the manager's desk.

## Operating Context

Fast-paced restaurant environments where speed and legibility are critical. Cashiers use tablets or desktop terminals at checkout; kitchen staff view large KDS screens in a high-pressure environment; managers review analytics and configuration from laptops.

## Capabilities and Constraints

- Real-time websocket updates (Laravel Reverb) for the KDS and Live Orders.
- UUIDs for all primary keys in the database.
- Role-based access control (Admin, Manager, Staff, Waiter).
- Multi-location/outlet support.

## Brand Commitments

"Cue Eats" (Modern, clear, and professional).

## Evidence on Hand

- Functional POS terminal with table management.
- Live real-time KDS.
- Complex inventory and supply-chain dashboards.

## Product Principles

1. **Clarity under pressure:** The UI must be instantly readable by staff during peak hours.
2. **Action-oriented:** Everything from checkout to completing orders must require minimal clicks.
3. **Robust feedback:** Users should immediately know the status of an order, a table, or a stock transfer.
