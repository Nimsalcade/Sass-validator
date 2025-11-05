import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  await prisma.toolCallAudit.deleteMany();
  await prisma.file.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.demandSignal.deleteMany();
  await prisma.pricing.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.researchRun.deleteMany();
  await prisma.source.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetDatabase();

  const primaryUser = await prisma.user.create({
    data: {
      name: 'Demo Admin',
      email: 'demo.admin@example.com',
      role: 'ADMIN'
    }
  });

  const collaborator = await prisma.user.create({
    data: {
      name: 'Research Collaborator',
      email: 'researcher@example.com'
    }
  });

  const project = await prisma.project.create({
    data: {
      name: 'Demo Product Launch',
      description: 'A showcase workspace seeded for evaluation.',
      status: 'ACTIVE',
      owner: {
        connect: { id: primaryUser.id }
      },
      metadata: {
        industry: 'SaaS',
        targetRole: 'Product Managers',
        stage: 'Beta'
      },
      members: {
        create: [
          {
            role: 'OWNER',
            user: { connect: { id: primaryUser.id } }
          },
          {
            role: 'COLLABORATOR',
            user: { connect: { id: collaborator.id } }
          }
        ]
      }
    }
  });

  const surveySource = await prisma.source.create({
    data: {
      projectId: project.id,
      name: 'Customer Surveys',
      type: 'survey',
      url: 'https://example.com/surveys',
      config: {
        cadence: 'weekly',
        lastSync: new Date().toISOString()
      }
    }
  });

  const socialSource = await prisma.source.create({
    data: {
      projectId: project.id,
      name: 'Social Listening',
      type: 'social',
      url: 'https://example.com/social',
      config: {
        provider: 'X/Twitter',
        query: '#productlaunch'
      }
    }
  });

  const researchRun = await prisma.researchRun.create({
    data: {
      projectId: project.id,
      sourceId: surveySource.id,
      initiatedById: primaryUser.id,
      status: 'COMPLETED',
      totalCost: new Prisma.Decimal('145.50'),
      summary: 'Synthesized weekly customer survey feedback to extract demand patterns.',
      metadata: {
        sampleSize: 128,
        methodology: 'qualitative clustering'
      },
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      completedAt: new Date(),
      resultEmbedding: [0.12, -0.04, 0.33]
    }
  });

  const competitor = await prisma.competitor.create({
    data: {
      projectId: project.id,
      name: 'Acme Analytics',
      description: 'Leading incumbent offering comparable analytics dashboards.',
      website: 'https://acme.example.com',
      strength: 4
    }
  });

  await prisma.pricing.createMany({
    data: [
      {
        competitorId: competitor.id,
        planName: 'Starter',
        price: new Prisma.Decimal('49.00'),
        currency: 'USD',
        billingCycle: 'monthly',
        metadata: { seats: 3 }
      },
      {
        competitorId: competitor.id,
        planName: 'Enterprise',
        price: new Prisma.Decimal('599.00'),
        currency: 'USD',
        billingCycle: 'monthly',
        metadata: { seats: 'unlimited', support: '24/7' }
      }
    ]
  });

  const demandSignal = await prisma.demandSignal.create({
    data: {
      projectId: project.id,
      sourceId: socialSource.id,
      competitorId: competitor.id,
      type: 'MARKET',
      description: 'Positive sentiment spike for onboarding automation topics.',
      magnitude: 7,
      recordedAt: new Date(),
      embedding: [0.08, 0.22, -0.11],
      metadata: {
        sentimentScore: 0.78,
        volume: 540
      }
    }
  });

  const experiment = await prisma.experiment.create({
    data: {
      projectId: project.id,
      researchRunId: researchRun.id,
      title: 'Onboarding Funnel Experiment',
      hypothesis: 'Automated setup will increase activation by 15%.',
      status: 'RUNNING',
      startedAt: new Date(),
      metrics: {
        primary: 'activation_rate',
        baseline: 0.32
      }
    }
  });

  const asset = await prisma.asset.create({
    data: {
      projectId: project.id,
      researchRunId: researchRun.id,
      experimentId: experiment.id,
      name: 'Customer Interview Transcript',
      type: 'DOCUMENT',
      uri: 's3://demo-bucket/transcripts/interview-001.txt',
      featureEmbedding: [0.21, -0.05, 0.17],
      metadata: {
        language: 'en',
        format: 'text/plain'
      }
    }
  });

  await prisma.file.create({
    data: {
      projectId: project.id,
      assetId: asset.id,
      kind: 'RAW',
      filename: 'interview-001.txt',
      path: '/files/interview-001.txt',
      mimeType: 'text/plain',
      size: 48213,
      checksum: 'd41d8cd98f00b204e9800998ecf8427e'
    }
  });

  await prisma.toolCallAudit.create({
    data: {
      projectId: project.id,
      researchRunId: researchRun.id,
      experimentId: experiment.id,
      actorId: collaborator.id,
      toolName: 'summarize_feedback',
      status: 'SUCCESS',
      arguments: {
        runId: researchRun.id,
        strategy: 'semantic_clusters'
      },
      result: {
        keyTakeaways: [
          'Demand for quicker integration remains high',
          'Users want clearer onboarding guidance'
        ]
      },
      invokedAt: new Date()
    }
  });

  await prisma.session.create({
    data: {
      userId: collaborator.id,
      sessionToken: 'demo-session-token',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  });

  await prisma.account.create({
    data: {
      userId: primaryUser.id,
      type: 'oauth',
      provider: 'github',
      providerAccountId: 'demo-admin',
      access_token: 'mock-access-token',
      token_type: 'bearer',
      scope: 'repo user'
    }
  });

  await prisma.verificationToken.create({
    data: {
      identifier: 'demo.admin@example.com',
      token: 'demo-verification-token',
      expires: new Date(Date.now() + 1000 * 60 * 15)
    }
  });

  console.log('Seed data created successfully. Project:', project.name, 'Demand signal id:', demandSignal.id);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
