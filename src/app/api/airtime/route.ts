import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Environment variables for API authentication
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

// GET handler to fetch available networks
export async function GET() {
  try {
    // Make a request to the external API to get available networks
    const response = await fetch("https://iabconcept.com/api/airtimeapi", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY || "",
        "secret-key": SECRET_KEY || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch networks" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching networks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler to purchase airtime
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, firstLevel, amount: amountValue } = body;

    const amount = parseFloat(amountValue);

    // Validate request body
    if (!phone || !firstLevel || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Validate phone number length
    if (phone.length !== 11) {
      return NextResponse.json(
        { error: "Phone number must be 11 digits" },
        { status: 400 }
      );
    }

    // Make a request to the external API to purchase airtime
    const response = await fetch("https://iabconcept.com/api/airtimeapi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY || "",
        "secret-key": SECRET_KEY || "",
      },
      body: JSON.stringify({
        phone,
        firstLevel,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to purchase airtime" },
        { status: response.status }
      );
    }

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }
    // Store the transaction in the database
    await prisma.transaction.create({
      data: {
        transactionId: data.airtimeHistory.transactionId,
        email: data.airtimeHistory.email,
        activity: data.airtimeHistory.activity,
        status: data.airtimeHistory.status,
        recipient: data.airtimeHistory.recipient,
        amount: data.airtimeHistory.amount,
        amountUsed: data.airtimeHistory.amountUsed,
        initialBalance: data.airtimeHistory.initialBalance,
        finalBalance: data.airtimeHistory.finalBalance,
        method: data.airtimeHistory.Method,
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error purchasing airtime:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
