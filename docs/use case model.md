/*
  Tsa Temo Thuo - Use Case Model
  Team 4 | CSI473 Lab 3 | 14 August 2026

  Notation:
    - Rectangle nodes outside the boundary  = actors (primary = solid border, secondary/external system = dashed border)
    - Ellipse nodes inside the boundary      = use cases
    - Solid edge                             = actor participates in use case
    - Dashed edge labelled <<include>>       = mandatory inclusion
    - Dashed edge labelled <<extend>>        = optional extension

  Render: dot -Tsvg use-case-model.dot -o use-case-model.svg
*/

digraph TsaTemoThuoUseCases {
  rankdir=LR;
  fontname="Helvetica";
  node [fontname="Helvetica", fontsize=11];
  edge [fontname="Helvetica", fontsize=9];
  bgcolor="white";
  nodesep=0.45;
  ranksep=0.9;
  splines=true;

  /* ---------- Primary actors (UML-style stick figures via HTML labels) ---------- */
  Farmer [shape=none, margin=0, label=<
    <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="2" CELLPADDING="2">
      <TR><TD><IMG SRC="stickman.png"/></TD></TR>
      <TR><TD><FONT POINT-SIZE="11">Farmer<BR/>(smallholder<BR/>horticulture)</FONT></TD></TR>
    </TABLE>
  >];
  Buyer [shape=none, margin=0, label=<
    <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="2" CELLPADDING="2">
      <TR><TD><IMG SRC="stickman.png"/></TD></TR>
      <TR><TD><FONT POINT-SIZE="11">Buyer<BR/>(restaurant / retailer /<BR/>street trader)</FONT></TD></TR>
    </TABLE>
  >];
  Transporter [shape=none, margin=0, label=<
    <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="2" CELLPADDING="2">
      <TR><TD><IMG SRC="stickman.png"/></TD></TR>
      <TR><TD><FONT POINT-SIZE="11">Transporter<BR/>(delivery provider)</FONT></TD></TR>
    </TABLE>
  >];
  Admin [shape=none, margin=0, label=<
    <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="2" CELLPADDING="2">
      <TR><TD><IMG SRC="stickman.png"/></TD></TR>
      <TR><TD><FONT POINT-SIZE="11">Administrator<BR/>(platform operator)</FONT></TD></TR>
    </TABLE>
  >];

  /* ---------- Secondary actors (external systems, stubbed) ---------- */
  subgraph cluster_external {
    label = "External Systems";
    fontsize = 12;
    style = "rounded,dashed";
    color = "#555555";
    labelloc = "t";

    MappingSvc [shape=box, style="rounded,dashed", label="OpenRouteService\n«stubbed»"];
    SmsGateway [shape=box, style="rounded,dashed", label="SMS Gateway\n«stubbed»"];
    Legend [shape=note, style=filled, fillcolor="#FFFDE7", color="#8B7500", fontsize=8,
            label="«stubbed» = simulated with fixed\nmock responses for this project.\nNo live third-party API is called;\navoids depending on an unavailable\nproprietary API for the core\ndemonstration (see project brief §4)."];
  }

  /* ---------- System boundary ---------- */
  subgraph cluster_system {
    label = "Tsa Temo Thuo System";
    fontsize = 13;
    style = "rounded";
    color = "#8B1E3F";
    penwidth = 2;
    labelloc = "t";

    node [shape=ellipse, style=filled, fillcolor="#FDFDFD", color="#8B1E3F"];

    UC_Register          [label="Register Account\n(Farmer / Buyer)"];
    UC_CreateListing     [label="Create Listing"];
    UC_ConfirmDecline    [label="Confirm / Decline\nOrder"];
    UC_RequestTransport  [label="Request Transport"];
    UC_ViewOrderStatus   [label="View Order Status\n& History"];
    UC_SearchListings    [label="Search Listings"];
    UC_PlaceOrder        [label="Place Order"];
    UC_ConfirmReceipt    [label="Confirm Receipt"];
    UC_AcceptJob         [label="Accept Transport Job"];
    UC_UpdateDelivery    [label="Update Delivery Status"];
    UC_Verify            [label="Verify Registration"];
    UC_GenerateReport    [label="Generate Order\nReport"];
    UC_ReserveStock      [label="Reserve Stock\n(atomic)", fillcolor="#FCE8EC"];
    UC_SendNotification  [label="Send Status\nNotification", fillcolor="#FCE8EC"];
  }

  /* ---------- Actor -> Use case associations ---------- */
  Farmer -> UC_Register;
  Farmer -> UC_CreateListing;
  Farmer -> UC_ConfirmDecline;
  Farmer -> UC_RequestTransport;
  Farmer -> UC_ViewOrderStatus;

  Buyer -> UC_Register;
  Buyer -> UC_SearchListings;
  Buyer -> UC_PlaceOrder;
  Buyer -> UC_ConfirmReceipt;
  Buyer -> UC_ViewOrderStatus;

  Transporter -> UC_AcceptJob;
  Transporter -> UC_UpdateDelivery;

  Admin -> UC_Verify;
  Admin -> UC_GenerateReport;
  Admin -> UC_ViewOrderStatus;

  /* ---------- Include / extend relationships ---------- */
  UC_PlaceOrder -> UC_ReserveStock [style=dashed, label="<<include>>"];
  UC_UpdateDelivery -> UC_SendNotification [style=dashed, label="<<extend>>"];

  /* ---------- Secondary actor associations ---------- */
  UC_RequestTransport -> MappingSvc [style=dotted, dir=none, label="route info"];
  UC_AcceptJob -> MappingSvc [style=dotted, dir=none, label="route info"];
  UC_SendNotification -> SmsGateway [style=dotted, dir=none, label="notify"];

  { rank=same; Farmer; Buyer; }
  { rank=same; Transporter; Admin; }
  { rank=same; MappingSvc; SmsGateway; }
}
